# core/views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from datetime import timedelta
import json
import random
from decimal import Decimal
from django.db.models import Q, Sum, Avg, Count
from django.template.loader import render_to_string
# from weasyprint import HTML
import tempfile

from .models import (
    User, Department, Course, AcademicSession, StudentCourse, 
    Result, CourseRegistration, RegistrationItem, Notification, VerificationCode
)

def main(request):
    """Render the main index page"""
    return render(request, 'core/index.html')

# ===========================================
# AUTHENTICATION APIS
# ===========================================

@csrf_exempt
def api_register(request):
    """Handle user registration via API"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=405)
    
    try:
        data = json.loads(request.body)
        
        # Check required fields
        required_fields = ['fullName', 'email', 'phone', 'password', 'matricNumber', 'department', 'programme', 'level']
        for field in required_fields:
            if not data.get(field):
                return JsonResponse({'success': False, 'message': f'{field} is required'}, status=400)
        
        # Check if user exists
        if User.objects.filter(email=data.get('email')).exists():
            return JsonResponse({
                'success': False,
                'message': 'This email address is already registered. Please use a different email or login.'
            }, status=400)
        
        if User.objects.filter(matric_number=data.get('matricNumber')).exists():
            return JsonResponse({
                'success': False, 
                'message': 'This matric number is already registered. Please check and try again.'
            }, status=400)
        
        # Get or create department
        dept_name = data.get('department')
        department, _ = Department.objects.get_or_create(
            name=dept_name,
            defaults={'code': dept_name[:3].upper()}
        )
        
        # Create user
        user = User.objects.create_user(
            email=data.get('email'),
            matric_number=data.get('matricNumber'),
            password=data.get('password'),
            full_name=data.get('fullName'),
            phone=data.get('phone'),
            department=dept_name,
            programme=data.get('programme'),
            level=data.get('level'),
            user_type='student',
            is_verified=True
        )
        
        # Get current academic session
        current_session = AcademicSession.objects.filter(is_current=True).first()
        if not current_session:
            current_session = AcademicSession.objects.create(
                name='2024/2025',
                is_current=True,
                start_date=timezone.now().date(),
                end_date=timezone.now().date() + timedelta(days=365)
            )
        
        # Create welcome notification
        Notification.objects.create(
            user=user,
            title='Welcome to MAPOLY Portal',
            message='Your account has been successfully created. You can now register for courses.',
            notification_type='success'
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Registration successful!',
            'user': {
                'id': str(user.id),
                'fullName': user.full_name,
                'email': user.email,
                'matricNumber': user.matric_number,
                'department': user.department,
                'programme': user.programme,
                'level': user.level,
                'userType': user.user_type,
                'isVerified': user.is_verified
            }
        }, status=201)
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON data'
        }, status=400)
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'Registration failed: {str(e)}'}, status=500)

@csrf_exempt
def api_login(request):
    """Handle user login via API"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=405)
    
    try:
        data = json.loads(request.body)
        matric_number = data.get('matricNumber')
        password = data.get('password')
        requested_user_type = data.get('userType') # Get the requested user type

        print(f"Login attempt: matric={matric_number}, requested_type={requested_user_type}")
        
        try:
            user = User.objects.get(matric_number=matric_number)
        except User.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Invalid credentials'}, status=400)
        
        # Check if the user's actual type matches the requested type
        if user.user_type != requested_user_type:
            return JsonResponse({
                'success': False, 
                'message': f'This account is registered as a {user.user_type}. Please select the correct user type.'
            }, status=400)
        
        if not user.check_password(password):
            return JsonResponse({'success': False, 'message': 'Invalid credentials'}, status=400)
        
        if not user.is_active:
            return JsonResponse({'success': False, 'message': 'Account is deactivated'}, status=400)
        
        user.last_login = timezone.now()
        user.save()
        
        auth_login(request, user)
        
        return JsonResponse({
            'success': True,
            'message': 'Login successful!',
            'user': {
                'id': str(user.id),
                'fullName': user.full_name,
                'email': user.email,
                'matricNumber': user.matric_number,
                'department': user.department,
                'programme': user.programme,
                'level': user.level,
                'cgpa': str(user.cgpa),
                'userType': user.user_type,
                'isVerified': user.is_verified
            }
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)

@csrf_exempt
def api_logout(request):
    """Handle user logout"""
    auth_logout(request)
    request.session.flush()
    return JsonResponse({'success': True, 'message': 'Logged out successfully!'})

@csrf_exempt
def api_check_auth(request):
    """Check if user is authenticated"""
    if request.user.is_authenticated:
        user = request.user
        return JsonResponse({
            'authenticated': True,
            'user': {
                'id': str(user.id),
                'fullName': user.full_name,
                'matricNumber': user.matric_number,
                'email': user.email,
                'department': user.department,
                'programme': user.programme,
                'level': user.level,
                'cgpa': str(user.cgpa),
                'userType': user.user_type,
                'isVerified': user.is_verified
            }
        })
    return JsonResponse({'authenticated': False})

@csrf_exempt
def api_check_email(request):
    """Check if email is already registered"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=405)
    
    try:
        data = json.loads(request.body)
        email = data.get('email')
        
        if not email:
            return JsonResponse({'success': False, 'message': 'Email is required'}, status=400)
        
        # Check if email exists
        exists = User.objects.filter(email=email).exists()
        
        return JsonResponse({
            'success': True,
            'exists': exists,
            'message': 'Email is available' if not exists else 'Email is already registered'
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)

@csrf_exempt
def api_check_phone(request):
    """Check if phone number is already registered"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=405)
    
    try:
        data = json.loads(request.body)
        phone = data.get('phone')
        
        if not phone:
            return JsonResponse({'success': False, 'message': 'Phone number is required'}, status=400)
        
        # Check if phone exists
        exists = User.objects.filter(phone=phone).exists()
        
        return JsonResponse({
            'success': True,
            'exists': exists,
            'message': 'Phone number is available' if not exists else 'This phone number is already registered'
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)

@csrf_exempt
def api_send_verification_code(request):
    """Send verification code to email"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=405)
    
    try:
        data = json.loads(request.body)
        email = data.get('email')
        
        # Generate 6-digit code
        code = str(random.randint(100000, 999999))
        expires_at = timezone.now() + timedelta(minutes=10)
        
        # Delete old codes
        VerificationCode.objects.filter(email=email).delete()
        
        # Save new code
        VerificationCode.objects.create(
            email=email,
            code=code,
            expires_at=expires_at
        )
        
        # In production, send email here
        print(f"Verification code for {email}: {code}")
        
        return JsonResponse({
            'success': True,
            'message': 'Verification code sent!',
            'code': code  # Only for demo
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)

@csrf_exempt
def api_verify_code(request):
    """Verify email verification code"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=405)
    
    try:
        data = json.loads(request.body)
        email = data.get('email')
        code = data.get('code')
        
        verification = VerificationCode.objects.filter(
            email=email,
            code=code,
            expires_at__gt=timezone.now(),
            is_used=False
        ).first()
        
        if verification:
            verification.is_used = True
            verification.save()
            return JsonResponse({'success': True, 'message': 'Email verified!'})
        else:
            return JsonResponse({'success': False, 'message': 'Invalid or expired verification code'}, status=400)
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)

# ===========================================
# STUDENT APIS
# ===========================================

@login_required
@csrf_exempt
def api_student_dashboard(request):
    """Get student dashboard data"""
    try:
        student = request.user
        
        # if student.user_type not in ['student']:
        #     return JsonResponse({'success': False, 'message': 'Access denied'}, status=403)
        
        # Get current academic session
        current_session = AcademicSession.objects.filter(is_current=True).first()
        current_session_name = current_session.name if current_session else '2024/2025'
        
        # Determine current semester based on month
        current_month = timezone.now().month
        current_semester = 1 if current_month in [1, 2, 3, 4, 5, 6] else 2
        
        # Get notifications
        notifications = Notification.objects.filter(
            user=student
        ).order_by('-created_at')[:10]
        
        # Get current semester courses
        current_courses = StudentCourse.objects.filter(
            student=student,
            semester=current_semester,
            academic_session=current_session
        ).select_related('course')
        
        # Get registered but not graded courses count
        registered_courses = StudentCourse.objects.filter(
            student=student,
            academic_session=current_session,
            grade='-'
        ).count()
        
        # Calculate total courses taken
        total_courses = StudentCourse.objects.filter(
            student=student
        ).exclude(grade='-').count()
        
        # Calculate CGPA
        all_results = Result.objects.filter(
            student=student,
            is_published=True
        )
        
        if all_results.exists():
            total_credits = all_results.aggregate(total=Sum('total_credit_units'))['total'] or 0
            total_points = all_results.aggregate(total=Sum('total_quality_points'))['total'] or 0
            cgpa = total_points / total_credits if total_credits > 0 else 0
        else:
            cgpa = student.cgpa
        
        return JsonResponse({
            'success': True,
            'dashboard': {
                'student': {
                    'fullName': student.full_name,
                    'matricNumber': student.matric_number,
                    'department': student.department,
                    'programme': student.programme,
                    'level': student.level,
                    'cgpa': str(round(cgpa, 2)),
                    'status': student.status
                },
                'academic': {
                    'currentSemester': current_semester,
                    'currentYear': current_session_name,
                    'totalCourses': registered_courses,
                    'completedCourses': total_courses,
                    'cgpa': str(round(cgpa, 2))
                },
                'financial': {
                    'feesPaid': float(student.school_fees_paid),
                    'feesRequired': float(student.school_fees_required),
                    'feesBalance': float(student.school_fees_required - student.school_fees_paid),
                    'feesStatus': student.fees_status
                },
                'notifications': [
                    {
                        'id': str(n.id),
                        'title': n.title,
                        'message': n.message,
                        'type': n.notification_type,
                        'time': n.created_at.strftime('%b %d, %Y'),
                        'read': n.is_read,
                        'link': n.link
                    } for n in notifications
                ]
            }
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)

@login_required
@csrf_exempt
def api_student_courses(request):
    """Get student courses"""
    try:
        student = request.user
        
        semester = request.GET.get('semester')
        session_id = request.GET.get('session')
        
        courses = StudentCourse.objects.filter(
            student=student
        ).select_related('course', 'academic_session').order_by('-academic_session__name', 'semester', 'course__code')
        
        if semester and semester != 'all':
            courses = courses.filter(semester=int(semester))
        if session_id:
            courses = courses.filter(academic_session_id=session_id)
        
        courses = courses.order_by('-academic_session__name', 'semester', 'course__code')
        
        return JsonResponse({
            'success': True,
            'courses': [
                {
                    'id': str(sc.id),
                    'code': sc.course.code,
                    'title': sc.course.title,
                    'creditUnits': sc.course.credit_units,
                    'semester': sc.semester,
                    'academicYear': sc.academic_session.name,
                    'grade': sc.grade,
                    'score': sc.score,
                    'gradePoint': sc.grade_point,
                    'qualityPoint': float(sc.quality_point),
                    'isRegistered': sc.is_registered
                } for sc in courses
            ]
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)

@login_required
@csrf_exempt
def api_student_results(request):
    """Get student results with course details"""
    try:
        student = request.user
        
        # Get all published results for the student
        results = Result.objects.filter(
            student=student,
            is_published=True
        ).select_related('academic_session').order_by('-academic_session__name', '-semester')
        
        result_list = []
        for result in results:
            # Get all courses for this result's semester
            courses = StudentCourse.objects.filter(
                student=student,
                academic_session=result.academic_session,
                semester=result.semester
            ).select_related('course')
            
            course_details = []
            for sc in courses:
                course_details.append({
                    'code': sc.course.code,
                    'title': sc.course.title,
                    'creditUnits': sc.course.credit_units,
                    'grade': sc.grade,
                    'score': sc.score,
                    'gradePoint': sc.grade_point,
                    'qualityPoint': float(sc.quality_point)
                })
            
            result_list.append({
                'id': str(result.id),
                'semester': result.semester,
                'academicYear': result.academic_session.name,
                'gpa': float(result.gpa),
                'totalCreditUnits': result.total_credit_units,
                'totalQualityPoints': float(result.total_quality_points),
                'isPublished': result.is_published,
                'publishedAt': result.published_at.strftime('%B %d, %Y') if result.published_at else None,
                'courses': course_details
            })
        
        # Calculate CGPA
        all_results = Result.objects.filter(
            student=student,
            is_published=True
        )
        
        total_credits = all_results.aggregate(total=Sum('total_credit_units'))['total'] or 0
        total_points = all_results.aggregate(total=Sum('total_quality_points'))['total'] or 0
        cgpa = total_points / total_credits if total_credits > 0 else 0
        
        return JsonResponse({
            'success': True,
            'results': result_list,
            'cgpa': float(cgpa),
            'totalSemesters': len(result_list)
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)

@login_required
@csrf_exempt
def api_available_courses(request):
    """Get available courses for registration"""
    try:
        student = request.user
        
        # Get current session
        current_session = AcademicSession.objects.filter(is_current=True).first()
        if not current_session:
            return JsonResponse({'success': False, 'message': 'No active academic session'}, status=400)
        
        # Determine current semester
        current_month = timezone.now().month
        current_semester = 1 if current_month in [1, 2, 3, 4, 5, 6] else 2
        
        # Check if already registered
        existing_registration = CourseRegistration.objects.filter(
            student=student,
            academic_session=current_session,
            semester=current_semester,
            status__in=['submitted', 'approved', 'printed']
        ).first()
        
        if existing_registration:
            return JsonResponse({
                'success': False,
                'message': f'You have already submitted registration for this semester',
                'status': existing_registration.status
            }, status=400)
        
        # Get department
        try:
            department = Department.objects.get(name=student.department)
        except Department.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Department not found'}, status=400)
        
        # Get available courses for student's level
        available_courses = Course.objects.filter(
            department=department,
            level=student.level,
            semester=current_semester,
            is_active=True
        ).order_by('code')
        
        # Get already registered courses
        registered_courses = StudentCourse.objects.filter(
            student=student,
            academic_session=current_session,
            semester=current_semester
        ).values_list('course_id', flat=True)
        
        return JsonResponse({
            'success': True,
            'session': {
                'id': str(current_session.id),
                'name': current_session.name,
                'semester': current_semester
            },
            'courses': [
                {
                    'id': str(c.id),
                    'code': c.code,
                    'title': c.title,
                    'creditUnits': c.credit_units,
                    'isElective': c.is_elective,
                    'isRegistered': str(c.id) in registered_courses
                } for c in available_courses
            ]
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)

@login_required
@csrf_exempt
def api_register_courses(request):
    """Register courses for current semester"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=405)
    
    try:
        student = request.user
        data = json.loads(request.body)
        course_ids = data.get('course_ids', [])
        
        if not course_ids:
            return JsonResponse({'success': False, 'message': 'No courses selected'}, status=400)
        
        # Get current session
        current_session = AcademicSession.objects.filter(is_current=True).first()
        if not current_session:
            return JsonResponse({'success': False, 'message': 'No active academic session'}, status=400)
        
        # Determine current semester
        current_month = timezone.now().month
        current_semester = 1 if current_month in [1, 2, 3, 4, 5, 6] else 2
        
        # Check if already registered
        existing_registration = CourseRegistration.objects.filter(
            student=student,
            academic_session=current_session,
            semester=current_semester,
            status__in=['submitted', 'approved', 'printed']
        ).first()
        
        if existing_registration:
            return JsonResponse({
                'success': False,
                'message': f'You have already submitted registration with status: {existing_registration.status}'
            }, status=400)
        
        # Create registration
        registration = CourseRegistration.objects.create(
            student=student,
            semester=current_semester,
            academic_session=current_session,
            status='submitted',
            submitted_at=timezone.now()
        )
        
        # Add courses and create StudentCourse records
        courses = Course.objects.filter(id__in=course_ids, is_active=True)
        
        for course in courses:
            # Add to registration
            RegistrationItem.objects.create(
                registration=registration,
                course=course
            )
            
            # Create or update student course
            StudentCourse.objects.update_or_create(
                student=student,
                course=course,
                academic_session=current_session,
                semester=current_semester,
                defaults={'is_registered': True}
            )
        
        # Create notification for HOD
        try:
            department = Department.objects.get(name=student.department)
            if department.hod:
                Notification.objects.create(
                    user=department.hod,
                    title='New Course Registration',
                    message=f'{student.full_name} ({student.matric_number}) has submitted course registration for {current_session.name} Semester {current_semester}',
                    notification_type='info',
                    link=f'/hod/registrations/{registration.id}/'
                )
        except Department.DoesNotExist:
            pass
        
        # Create notification for student
        Notification.objects.create(
            user=student,
            title='Course Registration Submitted',
            message=f'Your course registration for {current_session.name} Semester {current_semester} has been submitted for approval.',
            notification_type='success'
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Course registration submitted successfully',
            'registration': {
                'id': str(registration.id),
                'status': registration.status
            }
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)

@login_required
@csrf_exempt
def api_get_registration_status(request):
    """Get student's registration status"""
    try:
        student = request.user
        
        # Get current session
        current_session = AcademicSession.objects.filter(is_current=True).first()
        if not current_session:
            return JsonResponse({'success': False, 'message': 'No active academic session'}, status=400)
        
        # Determine current semester
        current_month = timezone.now().month
        current_semester = 1 if current_month in [1, 2, 3, 4, 5, 6] else 2
        
        registration = CourseRegistration.objects.filter(
            student=student,
            academic_session=current_session,
            semester=current_semester
        ).first()
        
        if registration:
            courses = registration.courses.all()
            return JsonResponse({
                'success': True,
                'hasRegistration': True,
                'registration': {
                    'id': str(registration.id),
                    'status': registration.status,
                    'submittedAt': registration.submitted_at.strftime('%b %d, %Y %H:%M') if registration.submitted_at else None,
                    'approvedAt': registration.approved_at.strftime('%b %d, %Y %H:%M') if registration.approved_at else None,
                    'rejectionReason': registration.rejection_reason,
                    'courses': [
                        {
                            'code': c.code,
                            'title': c.title,
                            'creditUnits': c.credit_units
                        } for c in courses
                    ]
                }
            })
        else:
            return JsonResponse({
                'success': True,
                'hasRegistration': False
            })
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)

@login_required
@csrf_exempt
def api_print_course_form(request, registration_id):
    """Generate printable course form"""
    try:
        student = request.user
        
        registration = get_object_or_404(
            CourseRegistration,
            id=registration_id,
            student=student
        )
        
        if registration.status not in ['approved', 'printed']:
            return JsonResponse({
                'success': False,
                'message': 'Course form is not approved yet'
            }, status=400)
        
        # Mark as printed
        registration.status = 'printed'
        registration.printed_at = timezone.now()
        registration.save()
        
        # Get courses
        courses = registration.courses.all().order_by('code')
        
        # Calculate total credit units
        total_credits = sum(c.credit_units for c in courses)
        
        # Get HOD info
        hod_name = 'Dr. Adebayo'
        hod_signature = None
        try:
            department = Department.objects.get(name=student.department)
            if department.hod:
                hod_name = department.hod.full_name
        except Department.DoesNotExist:
            pass
        
        # For API response, return JSON
        if request.headers.get('Accept') == 'application/json':
            return JsonResponse({
                'success': True,
                'form': {
                    'id': str(registration.id),
                    'studentName': student.full_name,
                    'matricNumber': student.matric_number,
                    'programme': student.programme,
                    'level': student.level,
                    'session': registration.academic_session.name,
                    'semester': registration.semester,
                    'status': registration.status,
                    'submittedAt': registration.submitted_at.strftime('%B %d, %Y') if registration.submitted_at else None,
                    'approvedAt': registration.approved_at.strftime('%B %d, %Y') if registration.approved_at else None,
                    'printedAt': registration.printed_at.strftime('%B %d, %Y %H:%M') if registration.printed_at else None,
                    'hodName': hod_name,
                    'totalCredits': total_credits,
                    'courses': [
                        {
                            'code': c.code,
                            'title': c.title,
                            'creditUnits': c.credit_units
                        } for c in courses
                    ]
                }
            })
        
        # For PDF generation (you'll implement this later)
        html_string = render_to_string('core/course_form_pdf.html', {
            'registration': registration,
            'student': student,
            'courses': courses,
            'total_credits': total_credits,
            'hod_name': hod_name,
            'current_date': timezone.now()
        })
        
        # Generate PDF
        # pdf_file = HTML(string=html_string).write_pdf()
        
        # response = HttpResponse(pdf_file, content_type='application/pdf')
        # response['Content-Disposition'] = f'attachment; filename="course_form_{student.matric_number}_{registration.academic_session.name}_sem{registration.semester}.pdf"'
        
        # return response
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)

# ===========================================
# HOD APIS
# ===========================================

@login_required
@csrf_exempt
def api_hod_dashboard(request):
    """Get HOD dashboard data"""
    try:
        hod = request.user
        
        if hod.user_type not in ['hod', 'admin']:
            return JsonResponse({'success': False, 'message': 'Access denied'}, status=403)
        
        # Get department students - REAL COUNT
        students = User.objects.filter(
            department=hod.department,
            user_type='student'
        )
        total_students = students.count()
        active_students = students.filter(is_active=True).count()
        
        # Get pending course forms - REAL COUNT
        pending_forms = CourseRegistration.objects.filter(
            student__department=hod.department,
            status='submitted'
        ).count()

        # Get active courses - REAL COUNT
        active_courses = Course.objects.filter(
            department=hod.department,
            is_active=True
        ).count()
        
        # Get graduated students (if you have a 'Graduated' level)
        graduated = students.filter(level='Graduated').count()
        
        # Get this semester's new students (registered in last 3 months)
        from django.utils import timezone
        from datetime import timedelta
        three_months_ago = timezone.now() - timedelta(days=90)
        new_students = students.filter(date_joined__gte=three_months_ago).count()

        # Get recent registrations - REAL DATA
        recent_registrations = CourseRegistration.objects.filter(
            student__department=hod.department
        ).select_related('student', 'academic_session').order_by('-submitted_at')[:5]
        
        registration_list = []
        for reg in recent_registrations:
            registration_list.append({
                'id': str(reg.id),
                'studentName': reg.student.full_name,
                'matricNumber': reg.student.matric_number,
                'level': reg.student.level,
                'semester': reg.semester,
                'academicYear': reg.academic_session.name if reg.academic_session else 'N/A',
                'submittedAt': reg.submitted_at.strftime('%b %d, %Y') if reg.submitted_at else None,
                'status': reg.status
            })
        
        # Get recent payments (if you have payment model) - REAL DATA
        # recent_payments = []  # Add your payment query here if you have one
        
        # Get department
        try:
            department = Department.objects.get(name=hod.department)
        except Department.DoesNotExist:
            department = Department.objects.create(
                name=hod.department,
                code=hod.department[:3].upper(),
                hod=hod
            )
        
        # Get current session
        current_session = AcademicSession.objects.filter(is_current=True).first()
        current_session_name = current_session.name if current_session else '2024/2025'
        
        # Get students in department
        students = User.objects.filter(
            department=hod.department,
            user_type='student'
        )
        
        # Get pending registrations
        pending_registrations = CourseRegistration.objects.filter(
            student__department=hod.department,
            status='submitted'
        ).count()
        
        # Get notifications
        notifications = Notification.objects.filter(
            user=hod,
            is_read=False
        ).order_by('-created_at')[:10]
        
        # Get recent registrations
        recent_registrations = CourseRegistration.objects.filter(
            student__department=hod.department
        ).select_related('student', 'academic_session').order_by('-submitted_at')[:10]
        
        # Get active courses
        active_courses = Course.objects.filter(
            department=department,
            is_active=True
        ).count()
        
        # Calculate statistics by level
        level_stats = {}
        for level in ['ND I', 'ND II', 'HND I', 'HND II']:
            level_students = students.filter(level=level)
            level_stats[level] = {
                'total': level_students.count(),
                'active': level_students.filter(is_active=True).count()
            }
        
        return JsonResponse({
            'success': True,
            'dashboard': {
                'user': {
                    'fullName': hod.full_name,
                    'email': hod.email,
                    'department': hod.department
                },
                'stats': {
                    'totalStudents': total_students,
                    'activeStudents': active_students,
                    'pendingForms': pending_forms,
                    'activeCourses': active_courses,
                    'graduated': graduated,
                    'levelStats': level_stats,
                    'newStudents': new_students
                },
                'recentRegistrations': registration_list,
                'notifications': [
                    {
                        'id': str(n.id),
                        'title': n.title,
                        'message': n.message,
                        'type': n.notification_type,
                        'time': n.created_at.strftime('%b %d, %Y'),
                        'read': n.is_read
                    } for n in notifications
                ]
            }
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)

@login_required
@csrf_exempt
def api_hod_students(request):
    """Get all students in HOD's department"""
    try:
        hod = request.user
        
        if hod.user_type not in ['hod', 'admin']:
            return JsonResponse({'success': False, 'message': 'Access denied'}, status=403)
        
        # Get filter parameters
        level = request.GET.get('level')
        programme = request.GET.get('programme')
        status = request.GET.get('status')
        search = request.GET.get('search')
        
        # Base queryset - filter by department
        students = User.objects.filter(
            department=hod.department,
            user_type='student'
        )
        
        # Apply filters
        if level:
            students = students.filter(level=level)
        if programme:
            students = students.filter(programme=programme)
        if status:
            is_active = (status == 'active')
            students = students.filter(is_active=is_active)
        if search:
            students = students.filter(
                Q(full_name__icontains=search) |
                Q(matric_number__icontains=search) |
                Q(email__icontains=search)
            )
        
        # Order by matric number
        students = students.order_by('matric_number')
        
        # Prepare response data
        student_list = []
        for student in students:
            # Calculate CGPA from results if available
            try:
                from .models import Result
                results = Result.objects.filter(student=student, is_published=True)
                if results.exists():
                    total_credits = results.aggregate(total=Sum('total_credit_units'))['total'] or 0
                    total_points = results.aggregate(total=Sum('total_quality_points'))['total'] or 0
                    cgpa = total_points / total_credits if total_credits > 0 else 0
                else:
                    cgpa = student.cgpa or 0
            except:
                cgpa = student.cgpa or 0
            
            student_list.append({
                'id': str(student.id),
                'fullName': student.full_name,
                'matricNumber': student.matric_number,
                'email': student.email,
                'phone': student.phone or '',
                'programme': student.programme,
                'level': student.level,
                'cgpa': float(cgpa),
                'feesStatus': student.fees_status,
                'isActive': student.is_active,
                'isVerified': student.is_verified,
                'dateJoined': student.registration_date.strftime('%b %d, %Y') if student.registration_date else ''
            })
        
        return JsonResponse({
            'success': True,
            'students': student_list,
            'filters': {
                'level': level,
                'programme': programme,
                'status': status,
                'search': search
            },
            'total': len(student_list)
        })
        
    except Exception as e:
        import traceback
        print(f"Error in api_hod_students: {str(e)}")
        print(traceback.format_exc())
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)

@login_required
@csrf_exempt
def api_hod_add_student(request):
    """Add new student"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=405)
    
    try:
        hod = request.user
        
        if hod.user_type not in ['hod', 'admin']:
            return JsonResponse({'success': False, 'message': 'Access denied'}, status=403)
        
        data = json.loads(request.body)
        
        # Validate required fields
        required_fields = ['fullName', 'email', 'matricNumber', 'programme', 'level']
        for field in required_fields:
            if not data.get(field):
                return JsonResponse({'success': False, 'message': f'{field} is required'}, status=400)
        
        # Check if user exists
        if User.objects.filter(email=data.get('email')).exists():
            return JsonResponse({'success': False, 'message': 'Email already registered'}, status=400)
        
        if User.objects.filter(matric_number=data.get('matricNumber')).exists():
            return JsonResponse({'success': False, 'message': 'Matric number already registered'}, status=400)
        
        # Generate random password
        import random
        import string
        temp_password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
        
        # Create student
        student = User.objects.create_user(
            email=data.get('email'),
            matric_number=data.get('matricNumber'),
            password=temp_password,
            full_name=data.get('fullName'),
            phone=data.get('phone', ''),
            department=hod.department,
            programme=data.get('programme'),
            level=data.get('level'),
            user_type='student',
            is_verified=True
        )
        
        # Create notification for student
        Notification.objects.create(
            user=student,
            title='Account Created',
            message=f'Your account has been created by the HOD. Your temporary password is: {temp_password}. Please login and change your password.',
            notification_type='success'
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Student added successfully',
            'student': {
                'id': str(student.id),
                'fullName': student.full_name,
                'matricNumber': student.matric_number,
                'email': student.email,
                'programme': student.programme,
                'level': student.level,
                'tempPassword': temp_password  # Only return once
            }
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)

@login_required
@csrf_exempt
def api_hod_update_student(request, student_id):
    """Update student information"""
    if request.method != 'PUT':
        return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=405)
    
    try:
        hod = request.user
        
        if hod.user_type not in ['hod', 'admin']:
            return JsonResponse({'success': False, 'message': 'Access denied'}, status=403)
        
        student = get_object_or_404(
            User,
            id=student_id,
            department=hod.department,
            user_type='student'
        )
        
        data = json.loads(request.body)
        
        # Update fields
        if 'fullName' in data:
            student.full_name = data['fullName']
        if 'phone' in data:
            student.phone = data['phone']
        if 'programme' in data:
            student.programme = data['programme']
        if 'level' in data:
            student.level = data['level']
        if 'isActive' in data:
            student.is_active = data['isActive']
        
        student.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Student updated successfully',
            'student': {
                'id': str(student.id),
                'fullName': student.full_name,
                'matricNumber': student.matric_number,
                'programme': student.programme,
                'level': student.level,
                'isActive': student.is_active
            }
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)

@login_required
@csrf_exempt
def api_hod_deactivate_student(request, student_id):
    """Deactivate student"""
    if request.method != 'DELETE':
        return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=405)
    
    try:
        hod = request.user
        
        if hod.user_type not in ['hod', 'admin']:
            return JsonResponse({'success': False, 'message': 'Access denied'}, status=403)
        
        student = get_object_or_404(
            User,
            id=student_id,
            department=hod.department,
            user_type='student'
        )
        
        student.is_active = False
        student.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Student deactivated successfully'
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)

@login_required
@csrf_exempt
def api_hod_courses(request):
    """Get all courses in department"""
    try:
        hod = request.user
        
        if hod.user_type not in ['hod', 'admin']:
            return JsonResponse({'success': False, 'message': 'Access denied'}, status=403)
        
        # Get the department UUID from the HOD's department field
        # First, find the Department object that matches the HOD's department name
        try:
            # Try to get department by name (since hod.department is a string)
            department = Department.objects.get(name=hod.department)
            dept_id = department.id
            dept_name = department.name
        except Department.DoesNotExist:
            # If no department found, try to get the first department
            department = Department.objects.first()
            if department:
                dept_id = department.id
                dept_name = department.name
                print(f"Using first department: {dept_name}")
            else:
                return JsonResponse({
                    'success': False, 
                    'message': 'No department found in database'
                }, status=404)
            
            # Get filter parameters
            level = request.GET.get('level')
            semester = request.GET.get('semester')
            
            # Filter courses by department ID (not name)
            courses = Course.objects.filter(department_id=dept_id)
            
            if level:
                courses = courses.filter(level=level)
            if semester:
                courses = courses.filter(semester=int(semester))
            
            courses = courses.order_by('level', 'semester', 'code')
            
            # Group by level (same as below)
            courses_by_level = {}
            for level_choice in ['ND I', 'ND II', 'HND I', 'HND II']:
                level_courses = courses.filter(level=level_choice)
                courses_by_level[level_choice] = {
                    'semester1': [
                        {
                            'id': str(c.id),
                            'code': c.code,
                            'title': c.title,
                            'creditUnits': c.credit_units,
                            'isElective': c.is_elective,
                            'isActive': c.is_active
                        } for c in level_courses.filter(semester=1)
                    ],
                    'semester2': [
                        {
                            'id': str(c.id),
                            'code': c.code,
                            'title': c.title,
                            'creditUnits': c.credit_units,
                            'isElective': c.is_elective,
                            'isActive': c.is_active
                        } for c in level_courses.filter(semester=2)
                    ]
                }
            
            return JsonResponse({
                'success': True,
                'courses': courses_by_level,
                'filters': {
                    'level': level,
                    'semester': semester
                },
                'department': {
                    'id': str(dept_id),
                    'name': dept_name
                },
                'message': 'Loaded all courses (department filter not applied)'
            })
        
    except Exception as e:
        import traceback
        print(f"Error in api_hod_courses: {str(e)}")
        print(traceback.format_exc())
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)

@login_required
@csrf_exempt
def api_hod_add_course(request):
    """Add new course"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=405)
    
    try:
        hod = request.user
        
        if hod.user_type not in ['hod', 'admin']:
            return JsonResponse({'success': False, 'message': 'Access denied'}, status=403)
        
        data = json.loads(request.body)
        
        # Validate required fields
        required_fields = ['code', 'title', 'creditUnits', 'semester', 'level']
        for field in required_fields:
            if not data.get(field):
                return JsonResponse({'success': False, 'message': f'{field} is required'}, status=400)
        
        department = get_object_or_404(Department, name=hod.department)
        
        # Check if course exists
        existing = Course.objects.filter(
            code=data['code'],
            semester=int(data['semester']),
            level=data['level'],
            department=department
        ).first()
        
        if existing:
            return JsonResponse({
                'success': False,
                'message': f'Course {data["code"]} already exists for {data["level"]} Semester {data["semester"]}'
            }, status=400)
        
        # Create course
        course = Course.objects.create(
            code=data['code'],
            title=data['title'],
            credit_units=int(data['creditUnits']),
            semester=int(data['semester']),
            level=data['level'],
            department=department,
            is_elective=data.get('isElective', False),
            created_by=hod
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Course added successfully',
            'course': {
                'id': str(course.id),
                'code': course.code,
                'title': course.title,
                'creditUnits': course.credit_units,
                'semester': course.semester,
                'level': course.level,
                'isElective': course.is_elective
            }
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)

@login_required
@csrf_exempt
def api_hod_update_course(request, course_id):
    """Update course"""
    if request.method != 'PUT':
        return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=405)
    
    try:
        hod = request.user
        
        if hod.user_type not in ['hod', 'admin']:
            return JsonResponse({'success': False, 'message': 'Access denied'}, status=403)
        
        department = get_object_or_404(Department, name=hod.department)
        course = get_object_or_404(Course, id=course_id, department=department)
        
        data = json.loads(request.body)
        
        # Update fields
        if 'title' in data:
            course.title = data['title']
        if 'creditUnits' in data:
            course.credit_units = int(data['creditUnits'])
        if 'isElective' in data:
            course.is_elective = data['isElective']
        if 'isActive' in data:
            course.is_active = data['isActive']
        
        course.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Course updated successfully',
            'course': {
                'id': str(course.id),
                'code': course.code,
                'title': course.title,
                'creditUnits': course.credit_units,
                'isElective': course.is_elective,
                'isActive': course.is_active
            }
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)

@login_required
@csrf_exempt
def api_hod_course_registrations(request):
    """Get pending course registrations"""
    try:
        hod = request.user
        
        if hod.user_type not in ['hod', 'admin']:
            return JsonResponse({'success': False, 'message': 'Access denied'}, status=403)
        
        status = request.GET.get('status', 'submitted')
        
        registrations = CourseRegistration.objects.filter(
            student__department=hod.department,
            status=status
        ).select_related('student', 'academic_session').order_by('-submitted_at')
        
        return JsonResponse({
            'success': True,
            'registrations': [
                {
                    'id': str(r.id),
                    'studentName': r.student.full_name,
                    'matricNumber': r.student.matric_number,
                    'level': r.student.level,
                    'programme': r.student.programme,
                    'semester': r.semester,
                    'academicYear': r.academic_session.name,
                    'submittedAt': r.submitted_at.strftime('%b %d, %Y %H:%M') if r.submitted_at else None,
                    'coursesCount': r.courses.count()
                } for r in registrations
            ]
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)

@login_required
@csrf_exempt
def api_hod_registration_detail(request, registration_id):
    """Get registration details"""
    try:
        hod = request.user
        
        if hod.user_type not in ['hod', 'admin']:
            return JsonResponse({'success': False, 'message': 'Access denied'}, status=403)
        
        registration = get_object_or_404(
            CourseRegistration,
            id=registration_id,
            student__department=hod.department
        )
        
        courses = registration.courses.all().order_by('code')
        total_credits = sum(c.credit_units for c in courses)
        
        return JsonResponse({
            'success': True,
            'registration': {
                'id': str(registration.id),
                'studentName': registration.student.full_name,
                'matricNumber': registration.student.matric_number,
                'level': registration.student.level,
                'programme': registration.student.programme,
                'semester': registration.semester,
                'academicYear': registration.academic_session.name,
                'status': registration.status,
                'submittedAt': registration.submitted_at.strftime('%b %d, %Y %H:%M') if registration.submitted_at else None,
                'approvedAt': registration.approved_at.strftime('%b %d, %Y %H:%M') if registration.approved_at else None,
                'rejectionReason': registration.rejection_reason,
                'totalCredits': total_credits,
                'courses': [
                    {
                        'code': c.code,
                        'title': c.title,
                        'creditUnits': c.credit_units,
                        'isElective': c.is_elective
                    } for c in courses
                ]
            }
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)

@login_required
@csrf_exempt
def api_hod_approve_registration(request, registration_id):
    """Approve or reject course registration"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=405)
    
    try:
        hod = request.user
        
        if hod.user_type not in ['hod', 'admin']:
            return JsonResponse({'success': False, 'message': 'Access denied'}, status=403)
        
        data = json.loads(request.body)
        action = data.get('action')
        
        registration = get_object_or_404(
            CourseRegistration,
            id=registration_id,
            student__department=hod.department
        )
        
        if action == 'approve':
            registration.status = 'approved'
            registration.approved_by = hod
            registration.approved_at = timezone.now()
            
            # Create notification for student
            Notification.objects.create(
                user=registration.student,
                title='Course Registration Approved',
                message=f'Your course registration for {registration.academic_session.name} Semester {registration.semester} has been approved. You can now print your course form.',
                notification_type='success'
            )
            
            message = 'Course registration approved successfully'
            
        elif action == 'reject':
            registration.status = 'rejected'
            registration.rejection_reason = data.get('reason', 'No reason provided')
            
            # Delete student course records
            StudentCourse.objects.filter(
                student=registration.student,
                academic_session=registration.academic_session,
                semester=registration.semester
            ).delete()
            
            # Create notification for student
            Notification.objects.create(
                user=registration.student,
                title='Course Registration Rejected',
                message=f'Your course registration for {registration.academic_session.name} Semester {registration.semester} has been rejected. Reason: {registration.rejection_reason}',
                notification_type='error'
            )
            
            message = 'Course registration rejected'
            
        else:
            return JsonResponse({'success': False, 'message': 'Invalid action'}, status=400)
        
        registration.save()
        
        return JsonResponse({
            'success': True,
            'message': message,
            'status': registration.status
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)

@login_required
@csrf_exempt
def api_hod_course_students(request):
    """Get students for a specific course"""
    try:
        hod = request.user
        
        if hod.user_type not in ['hod', 'admin']:
            return JsonResponse({'success': False, 'message': 'Access denied'}, status=403)
        
        course_id = request.GET.get('course_id')
        semester = request.GET.get('semester')
        session_id = request.GET.get('session_id')
        
        if not all([course_id, semester, session_id]):
            return JsonResponse({'success': False, 'message': 'Missing required parameters'}, status=400)
        
        course = get_object_or_404(Course, id=course_id)
        session = get_object_or_404(AcademicSession, id=session_id)
        
        student_courses = StudentCourse.objects.filter(
            course=course,
            semester=int(semester),
            academic_session=session
        ).select_related('student')
        
        return JsonResponse({
            'success': True,
            'course': {
                'id': str(course.id),
                'code': course.code,
                'title': course.title,
                'creditUnits': course.credit_units
            },
            'session': {
                'id': str(session.id),
                'name': session.name
            },
            'semester': semester,
            'students': [
                {
                    'id': str(sc.student.id),
                    'matricNumber': sc.student.matric_number,
                    'fullName': sc.student.full_name,
                    'programme': sc.student.programme,
                    'level': sc.student.level,
                    'grade': sc.grade,
                    'score': sc.score,
                    'isRegistered': sc.is_registered
                } for sc in student_courses
            ]
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)

@login_required
@csrf_exempt
def api_hod_upload_results(request):
    """Upload student results"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=405)
    
    try:
        hod = request.user
        
        if hod.user_type not in ['hod', 'admin']:
            return JsonResponse({'success': False, 'message': 'Access denied'}, status=403)
        
        data = json.loads(request.body)
        
        course_id = data.get('course_id')
        semester = data.get('semester')
        session_id = data.get('session_id')
        results = data.get('results', [])
        
        if not all([course_id, semester, session_id, results]):
            return JsonResponse({'success': False, 'message': 'Missing required fields'}, status=400)
        
        course = get_object_or_404(Course, id=course_id)
        session = get_object_or_404(AcademicSession, id=session_id)
        
        updated_count = 0
        
        for result in results:
            student_id = result.get('student_id')
            score = result.get('score')
            
            if not student_id or score is None:
                continue
            
            # Validate score
            try:
                score = int(score)
                if score < 0 or score > 100:
                    continue
            except ValueError:
                continue
            
            # Determine grade
            if score >= 70:
                grade = 'A'
            elif score >= 60:
                grade = 'B'
            elif score >= 50:
                grade = 'C'
            elif score >= 45:
                grade = 'D'
            elif score >= 40:
                grade = 'E'
            else:
                grade = 'F'
            
            # Update student course
            student_course = StudentCourse.objects.filter(
                student_id=student_id,
                course=course,
                semester=int(semester),
                academic_session=session
            ).first()
            
            if student_course:
                student_course.score = score
                student_course.grade = grade
                student_course.save()
                updated_count += 1
        
        # Calculate GPA for each student in this course
        students_in_course = StudentCourse.objects.filter(
            course=course,
            semester=int(semester),
            academic_session=session
        ).values_list('student', flat=True).distinct()
        
        for student_id in students_in_course:
            # Get all courses for this student in this semester
            student_courses = StudentCourse.objects.filter(
                student_id=student_id,
                semester=int(semester),
                academic_session=session
            ).exclude(grade='-')
            
            if student_courses.exists():
                total_credits = sum(sc.course.credit_units for sc in student_courses)
                total_points = sum(sc.quality_point for sc in student_courses)
                
                if total_credits > 0:
                    gpa = total_points / total_credits
                    
                    # Update or create result
                    result, created = Result.objects.update_or_create(
                        student_id=student_id,
                        semester=int(semester),
                        academic_session=session,
                        defaults={
                            'gpa': gpa,
                            'total_credit_units': total_credits,
                            'total_quality_points': total_points,
                            'is_published': True,
                            'published_by': hod,
                            'published_at': timezone.now()
                        }
                    )
        
        return JsonResponse({
            'success': True,
            'message': f'Results uploaded successfully. {updated_count} records updated.',
            'updated': updated_count
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)

@login_required
@csrf_exempt
def api_hod_publish_results(request, result_id):
    """Publish/unpublish results"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=405)
    
    try:
        hod = request.user
        
        if hod.user_type not in ['hod', 'admin']:
            return JsonResponse({'success': False, 'message': 'Access denied'}, status=403)
        
        result = get_object_or_404(
            Result,
            id=result_id,
            student__department=hod.department
        )
        
        data = json.loads(request.body)
        publish = data.get('publish', True)
        
        result.is_published = publish
        if publish:
            result.published_by = hod
            result.published_at = timezone.now()
        else:
            result.published_by = None
            result.published_at = None
        
        result.save()
        
        # Create notification for student
        Notification.objects.create(
            user=result.student,
            title='Results Published' if publish else 'Results Unpublished',
            message=f'Your results for {result.academic_session.name} Semester {result.semester} have been {"published" if publish else "unpublished"}.',
            notification_type='success' if publish else 'warning'
        )
        
        return JsonResponse({
            'success': True,
            'message': f'Results {"published" if publish else "unpublished"} successfully',
            'isPublished': result.is_published
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)

@login_required
@csrf_exempt
def api_hod_reports(request):
    """Get department reports"""
    try:
        hod = request.user
        
        if hod.user_type not in ['hod', 'admin']:
            return JsonResponse({'success': False, 'message': 'Access denied'}, status=403)
        
        report_type = request.GET.get('type', 'summary')
        
        if report_type == 'summary':
            # Get summary statistics
            students = User.objects.filter(
                department=hod.department,
                user_type='student'
            )
            
            # Get current session
            current_session = AcademicSession.objects.filter(is_current=True).first()
            
            # Performance by level
            performance_by_level = {}
            for level in ['ND I', 'ND II', 'HND I', 'HND II']:
                level_students = students.filter(level=level)
                
                # Get average GPA for this level
                level_results = Result.objects.filter(
                    student__in=level_students,
                    is_published=True
                )
                
                avg_gpa = level_results.aggregate(avg=Avg('gpa'))['avg'] or 0
                
                performance_by_level[level] = {
                    'studentCount': level_students.count(),
                    'avgGPA': round(float(avg_gpa), 2)
                }
            
            # Registration statistics
            registrations = CourseRegistration.objects.filter(
                student__department=hod.department
            )
            
            registration_stats = {
                'draft': registrations.filter(status='draft').count(),
                'submitted': registrations.filter(status='submitted').count(),
                'approved': registrations.filter(status='approved').count(),
                'rejected': registrations.filter(status='rejected').count(),
                'printed': registrations.filter(status='printed').count()
            }
            
            return JsonResponse({
                'success': True,
                'reports': {
                    'performance_by_level': performance_by_level,
                    'registration_stats': registration_stats,
                    'total_students': students.count(),
                    'active_students': students.filter(is_active=True).count()
                }
            })
        
        elif report_type == 'performance':
            # Get performance report by session
            session_id = request.GET.get('session_id')
            
            results = Result.objects.filter(
                student__department=hod.department,
                is_published=True
            )
            
            if session_id:
                results = results.filter(academic_session_id=session_id)
            
            # Group by session and semester
            report_data = {}
            for result in results:
                key = f"{result.academic_session.name}_Sem{result.semester}"
                if key not in report_data:
                    report_data[key] = {
                        'session': result.academic_session.name,
                        'semester': result.semester,
                        'gpa_sum': 0,
                        'count': 0
                    }
                report_data[key]['gpa_sum'] += float(result.gpa)
                report_data[key]['count'] += 1
            
            # Calculate averages
            for key in report_data:
                if report_data[key]['count'] > 0:
                    report_data[key]['avg_gpa'] = round(report_data[key]['gpa_sum'] / report_data[key]['count'], 2)
                del report_data[key]['gpa_sum']
            
            return JsonResponse({
                'success': True,
                'reports': list(report_data.values())
            })
        
        return JsonResponse({'success': False, 'message': 'Invalid report type'}, status=400)
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)