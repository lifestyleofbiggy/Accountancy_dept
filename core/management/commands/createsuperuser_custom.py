from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a superuser with custom fields'

    def handle(self, *args, **options):
        email = input("Email: ")
        matric_number = input("Matric Number (for admin use ADMIN001): ")
        password = input("Password: ")
        
        user = User.objects.create_superuser(
            email=email,
            matric_number=matric_number,
            password=password,
            full_name='Administrator',
            phone='+2348000000000',
            department='Administration',
            programme='Administration',
            level='Admin'
        )
        
        self.stdout.write(self.style.SUCCESS(f'Superuser created: {email}'))