from django import forms
from django.contrib.auth.forms import AuthenticationForm
from .models import User

class RegistrationForm(forms.ModelForm):
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'form-input',
            'placeholder': 'Minimum 8 characters'
        }),
        min_length=8
    )
    confirm_password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'form-input',
            'placeholder': 'Re-enter your password'
        })
    )
    
    class Meta:
        model = User
        fields = ['full_name', 'email', 'phone', 'matric_number', 'department', 'programme', 'level']
        widgets = {
            'full_name': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Surname First'}),
            'email': forms.EmailInput(attrs={'class': 'form-input', 'placeholder': 'student@mapoly.edu.ng'}),
            'phone': forms.TextInput(attrs={'class': 'form-input', 'placeholder': '+2348012345678'}),
            'matric_number': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'MAP/ACC/XXXX'}),
            'department': forms.Select(attrs={'class': 'form-input'}),
            'programme': forms.Select(attrs={'class': 'form-input'}),
            'level': forms.Select(attrs={'class': 'form-input'}),
        }
    
    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        confirm_password = cleaned_data.get('confirm_password')
        
        if password and confirm_password and password != confirm_password:
            self.add_error('confirm_password', 'Passwords do not match')
        
        return cleaned_data
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data['password'])
        if commit:
            user.save()
        return user

class LoginForm(forms.Form):
    matric_number = forms.CharField(
        max_length=50,
        widget=forms.TextInput(attrs={
            'class': 'form-input',
            'placeholder': 'Matriculation Number'
        })
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'form-input',
            'placeholder': 'Enter your password'
        })
    )
    user_type = forms.ChoiceField(
        choices=User.USER_TYPE_CHOICES,
        initial='student',
        widget=forms.Select(attrs={'class': 'form-input'})
    )

class VerificationForm(forms.Form):
    email = forms.EmailField(widget=forms.EmailInput(attrs={'class': 'form-input'}))
    code = forms.CharField(max_length=6, widget=forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Enter 6-digit code'}))

class ForgotPasswordForm(forms.Form):
    matric_number = forms.CharField(max_length=50, widget=forms.TextInput(attrs={'class': 'form-input'}))
    email = forms.EmailField(widget=forms.EmailInput(attrs={'class': 'form-input'}))

class ProfileUpdateForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['full_name', 'phone', 'email']
        widgets = {
            'full_name': forms.TextInput(attrs={'class': 'form-input'}),
            'phone': forms.TextInput(attrs={'class': 'form-input'}),
            'email': forms.EmailInput(attrs={'class': 'form-input'}),
        }