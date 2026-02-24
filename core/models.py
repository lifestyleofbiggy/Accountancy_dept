# core/models.py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
import uuid
from decimal import Decimal

class CustomUserManager(BaseUserManager):
    def create_user(self, email, matric_number, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        if not matric_number:
            raise ValueError('The Matric Number field must be set')
        
        email = self.normalize_email(email)
        user = self.model(email=email, matric_number=matric_number, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, matric_number, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_verified', True)
        extra_fields.setdefault('user_type', 'admin')
        extra_fields.setdefault('full_name', 'Super Admin')
        extra_fields.setdefault('department', 'Administration')
        extra_fields.setdefault('programme', 'Administration')
        extra_fields.setdefault('level', 'Admin')
        extra_fields.setdefault('phone', '+2348000000000')
        
        return self.create_user(email, matric_number, password, **extra_fields)

class User(AbstractBaseUser):
    USER_TYPE_CHOICES = (
        ('student', 'Student'),
        ('hod', 'Head of Department'),
        ('admin', 'Administrator'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    matric_number = models.CharField(max_length=50, unique=True)
    full_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20, unique=True)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='student')
    
    # Academic Information
    department = models.CharField(max_length=100, default='Accountancy')
    programme = models.CharField(max_length=100, default='ND Accountancy')
    level = models.CharField(max_length=20, default='ND I')
    session = models.CharField(max_length=20, default='2024/2025')
    
    # Status fields
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    
    # Financial - Keep for now but not implementing payment
    school_fees_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    school_fees_required = models.DecimalField(max_digits=10, decimal_places=2, default=150000.00)
    
    # Academic
    cgpa = models.DecimalField(max_digits=4, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, default='active')
    registration_date = models.DateField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)
    
    objects = CustomUserManager()
    
    USERNAME_FIELD = 'matric_number'
    REQUIRED_FIELDS = ['email', 'full_name']
    
    class Meta:
        db_table = 'users'
    
    def __str__(self):
        return f"{self.full_name} ({self.matric_number})"
    
    def has_perm(self, perm, obj=None):
        return self.is_superuser
    
    def has_module_perms(self, app_label):
        return self.is_superuser
    
    @property
    def fees_status(self):
        balance = self.school_fees_required - self.school_fees_paid
        if balance <= 0:
            return 'paid'
        elif balance > 0 and balance < self.school_fees_required:
            return 'partial'
        else:
            return 'unpaid'

class Department(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    hod = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='hod_department')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'departments'
    
    def __str__(self):
        return self.name

class Course(models.Model):
    SEMESTER_CHOICES = (
        (1, 'First Semester'),
        (2, 'Second Semester'),
    )

    LEVEL_CHOICES = (
        ('ND I', 'ND I'),
        ('ND II', 'ND II'),
        ('HND I', 'HND I'),
        ('HND II', 'HND II'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=20)
    title = models.CharField(max_length=200)
    credit_units = models.IntegerField()
    semester = models.IntegerField(choices=SEMESTER_CHOICES)
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='courses')
    is_elective = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'courses'
        unique_together = ['code', 'semester', 'level', 'department']
    
    def __str__(self):
        return f"{self.code} - {self.title}"

class AcademicSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=20)  # e.g., "2024/2025"
    is_current = models.BooleanField(default=False)
    start_date = models.DateField()
    end_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'academic_sessions'
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if self.is_current:
            # Set all other sessions to not current
            AcademicSession.objects.filter(is_current=True).update(is_current=False)
        super().save(*args, **kwargs)

class StudentCourse(models.Model):
    GRADE_CHOICES = (
        ('A', 'A'),
        ('B', 'B'),
        ('C', 'C'),
        ('D', 'D'),
        ('E', 'E'),
        ('F', 'F'),
        ('-', 'Not Graded'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='student_courses')
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    semester = models.IntegerField()
    academic_session = models.ForeignKey(AcademicSession, on_delete=models.CASCADE)
    grade = models.CharField(max_length=1, choices=GRADE_CHOICES, default='-')
    score = models.IntegerField(null=True, blank=True)
    is_registered = models.BooleanField(default=True)
    registered_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'student_courses'
        unique_together = ['student', 'course', 'academic_session']
    
    @property
    def grade_point(self):
        grade_points = {'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'F': 0, '-': 0}
        return grade_points.get(self.grade, 0)
    
    @property
    def quality_point(self):
        return self.grade_point * self.course.credit_units

class Result(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='results')
    semester = models.IntegerField()
    academic_session = models.ForeignKey(AcademicSession, on_delete=models.CASCADE)
    gpa = models.DecimalField(max_digits=4, decimal_places=2, default=0.00)
    total_credit_units = models.IntegerField(default=0)
    total_quality_points = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_published = models.BooleanField(default=False)
    published_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='published_results')
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'results'
        unique_together = ['student', 'semester', 'academic_session']
    
    def __str__(self):
        return f"{self.student.matric_number} - {self.academic_session} Sem {self.semester}"

class CourseRegistration(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('printed', 'Printed'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='course_registrations')
    semester = models.IntegerField()
    academic_session = models.ForeignKey(AcademicSession, on_delete=models.CASCADE)
    courses = models.ManyToManyField(Course, through='RegistrationItem')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    submitted_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_registrations')
    approved_at = models.DateTimeField(null=True, blank=True)
    printed_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'course_registrations'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.student.matric_number} - {self.academic_session} Sem {self.semester}"

class RegistrationItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    registration = models.ForeignKey(CourseRegistration, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'registration_items'
        unique_together = ['registration', 'course']

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('success', 'Success'),
        ('warning', 'Warning'),
        ('info', 'Information'),
        ('error', 'Error'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=10, choices=NOTIFICATION_TYPES, default='info')
    is_read = models.BooleanField(default=False)
    link = models.CharField(max_length=200, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.user.matric_number}"

class VerificationCode(models.Model):
    email = models.EmailField()
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'verification_codes'
    
    def is_valid(self):
        return not self.is_used and timezone.now() < self.expires_at