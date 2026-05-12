from django.contrib import admin
from .models import Officer, Member, Event
from .models import Notification
from .models import Task

admin.site.register(Officer)
admin.site.register(Member)
admin.site.register(Event)
admin.site.register(Notification)
admin.site.register(Task)
# Register your models here.
