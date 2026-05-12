from django.db import models

class Officer(models.Model):
    organization = models.ForeignKey('Organization', on_delete=models.CASCADE, null=True)
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    position = models.CharField(max_length=100)
    school_year = models.CharField(max_length=20)
    profile_image = models.ImageField(upload_to='profiles/', null=True, blank=True)
    sidebar_image = models.ImageField(upload_to='profiles/', null=True, blank=True)

    def __str__(self):
        return self.name
    
    
class Event(models.Model):
    organization = models.ForeignKey('Organization', on_delete=models.CASCADE, null=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    location = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return self.title
    
class Notification(models.Model):
    message = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.message
    
class Task(models.Model):
    organization = models.ForeignKey('Organization', on_delete=models.CASCADE, null=True)
    title = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class SchoolYear(models.Model):
    name = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.name
    
class Member(models.Model):
    organization = models.ForeignKey('Organization', on_delete=models.CASCADE, null=True, blank=True)

    name = models.CharField(max_length=100)
    email = models.EmailField(blank=True, null=True)
    contact = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=100)
    status = models.CharField(max_length=50)
    image = models.ImageField(upload_to='profiles/', null=True, blank=True)

    year = models.CharField(max_length=10, default="2026")
    year_level = models.CharField(max_length=10, default="1") 

    # ✅ ADD THESE
    course = models.CharField(max_length=50, default="BSIT")
    sex = models.CharField(max_length=10, blank=True)
    semester = models.CharField(max_length=50, blank=True)

    payment_status = models.CharField(max_length=20, default="UNPAID")
    amount_paid = models.FloatField(default=0)

    def __str__(self):
        return self.name
    
class Attendance(models.Model):
    organization = models.ForeignKey('Organization', on_delete=models.CASCADE, null=True)
    student_id = models.CharField(max_length=50)
    full_name = models.CharField(max_length=200)
    event = models.CharField(max_length=200)
    time_type = models.CharField(max_length=20)
    status = models.CharField(max_length=10)

    # 🔥 ADD THESE
    semester = models.CharField(max_length=50)
    date = models.DateField()

    def __str__(self):
        return f"{self.full_name} - {self.event} - {self.status}"
    
class AttendanceFile(models.Model):
    organization = models.ForeignKey('Organization', on_delete=models.CASCADE, null=True)
    file = models.FileField(upload_to='attendance_files/')
    event = models.CharField(max_length=200)
    date = models.DateField()
    time_type = models.CharField(max_length=20)
    semester = models.CharField(max_length=50)

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file.name


    
class Folder(models.Model):
    name = models.CharField(max_length=100)
    organization = models.ForeignKey('Organization', on_delete=models.CASCADE, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
class FileResource(models.Model):
    organization = models.ForeignKey('Organization', on_delete=models.CASCADE, null=True)
    file = models.FileField(upload_to='files/')
    name = models.CharField(max_length=255)
    size = models.CharField(max_length=50)
    owner = models.CharField(max_length=100)

    folder = models.ForeignKey(Folder, on_delete=models.CASCADE, null=True, blank=True)

    uploaded_at = models.DateTimeField(auto_now_add=True)

import random
import string
from django.contrib.auth.models import User

class Organization(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=8, unique=True, blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
    
class JoinRequest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, default="pending")