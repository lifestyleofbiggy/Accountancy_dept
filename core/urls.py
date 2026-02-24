# core/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Main
    path('', views.main, name='home'),
    
    # Auth APIs
    path('api/register/', views.api_register, name='api_register'),
    path('api/login/', views.api_login, name='api_login'),
    path('api/logout/', views.api_logout, name='api_logout'),
    path('api/check-auth/', views.api_check_auth, name='api_check_auth'),
    path('api/check-email/', views.api_check_email, name='api_check_email'),
    path('api/check-phone/', views.api_check_phone, name='api_check_phone'),
    path('api/send-verification-code/', views.api_send_verification_code, name='api_send_verification_code'),
    path('api/verify-code/', views.api_verify_code, name='api_verify_code'),
    
    # Student APIs
    path('api/student/dashboard/', views.api_student_dashboard, name='api_student_dashboard'),
    path('api/student/courses/', views.api_student_courses, name='api_student_courses'),
    path('api/student/results/', views.api_student_results, name='api_student_results'),
    path('api/student/available-courses/', views.api_available_courses, name='api_available_courses'),
    path('api/student/register-courses/', views.api_register_courses, name='api_register_courses'),
    path('api/student/registration-status/', views.api_get_registration_status, name='api_get_registration_status'),
    path('api/student/print-course-form/<uuid:registration_id>/', views.api_print_course_form, name='api_print_course_form'),
    
    # HOD APIs
    path('api/hod/dashboard/', views.api_hod_dashboard, name='api_hod_dashboard'),
    path('api/hod/students/', views.api_hod_students, name='api_hod_students'),
    path('api/hod/students/add/', views.api_hod_add_student, name='api_hod_add_student'),
    path('api/hod/students/<uuid:student_id>/', views.api_hod_update_student, name='api_hod_update_student'),
    path('api/hod/students/<uuid:student_id>/deactivate/', views.api_hod_deactivate_student, name='api_hod_deactivate_student'),
    
    path('api/hod/courses/', views.api_hod_courses, name='api_hod_courses'),
    path('api/hod/courses/add/', views.api_hod_add_course, name='api_hod_add_course'),
    path('api/hod/courses/<uuid:course_id>/', views.api_hod_update_course, name='api_hod_update_course'),
    
    path('api/hod/registrations/', views.api_hod_course_registrations, name='api_hod_course_registrations'),
    path('api/hod/registrations/<uuid:registration_id>/', views.api_hod_registration_detail, name='api_hod_registration_detail'),
    path('api/hod/registrations/<uuid:registration_id>/approve/', views.api_hod_approve_registration, name='api_hod_approve_registration'),
    
    path('api/hod/course-students/', views.api_hod_course_students, name='api_hod_course_students'),
    path('api/hod/upload-results/', views.api_hod_upload_results, name='api_hod_upload_results'),
    path('api/hod/results/<uuid:result_id>/publish/', views.api_hod_publish_results, name='api_hod_publish_results'),
    
    path('api/hod/reports/', views.api_hod_reports, name='api_hod_reports'),
]