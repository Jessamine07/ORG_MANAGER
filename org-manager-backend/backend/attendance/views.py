from enum import member
import json
from urllib import request
import unicodedata
import unicodedata
import re

from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
import pandas as pd
from datetime import datetime
from .models import Folder, Officer
from .models import Member
from .models import Event
from .models import Task

# TEMP SAMPLE (later replace with DB)
from .models import Notification
from .models import SchoolYear
from .models import Attendance
from .models import AttendanceFile
from .models import FileResource
from django.contrib.auth import authenticate, login, logout
from .models import Organization, JoinRequest
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import check_password
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny


def normalize_name(name):
    if not name:
        return ""

    name = str(name).strip().upper()

    # 🔥 fix Ñ and weird unicode
    name = unicodedata.normalize("NFKD", name)

    # 🔥 remove extra spaces
    name = re.sub(r"\s+", " ", name)

    return name

def safe_display_name(name):
    if not name:
        return "UNKNOWN"

    try:
        name = str(name)

        # normalize unicode (fix ñ)
        name = unicodedata.normalize("NFKC", name)

        # remove weird invisible chars
        name = name.replace("\uFFFD", "")

        return name.strip()

    except:
        return "UNKNOWN"

@api_view(['GET'])
def get_notifications(request):
    notifications = Notification.objects.all().order_by('-created_at')

    data = []
    for n in notifications:
        data.append({
            "id": n.id,
            "message": n.message,
            "time": n.created_at.strftime("%b %d, %I:%M %p")
        })

    return Response(data)

@api_view(['POST'])
def clear_notifications(request):
    Notification.objects.all().delete()
    return Response({"message": "Cleared"})



from .models import Officer

@api_view(['GET'])
def dashboard_stats(request):

    # ✅ TOTAL STUDENTS ONLY
    total_members = Member.objects.filter(
        role="STUDENT"
    ).count()

    # ✅ TOTAL EVENTS
    active_events = Event.objects.count()

    # ✅ ATTENDANCE COUNTS
    total_records = Attendance.objects.count()

    present_records = Attendance.objects.filter(
        status="present"
    ).count()

    # ✅ COMPUTE PERCENTAGE
    attendance_rate = 0

    if total_records > 0:
        attendance_rate = round(
            (present_records / total_records) * 100
        )

    return JsonResponse({
        "total_members": total_members,
        "active_events": active_events,
        "attendance_rate": attendance_rate
    })

@api_view(['GET'])
def get_profile(request):
    officer, created = Officer.objects.get_or_create(id=1)

    if not officer:
        officer = Officer.objects.create(
            name="",
            email="",
            phone="",
            position="",
            school_year=""
        )

    return Response({
        "name": officer.name,
        "email": officer.email,
        "phone": officer.phone,
        "position": officer.position,
        "school_year": officer.school_year,
        "profile_image": request.build_absolute_uri(officer.profile_image.url) if officer.profile_image else None,
        "sidebar_image": request.build_absolute_uri(officer.sidebar_image.url) if officer.sidebar_image else None,
    })

@api_view(['POST'])
def update_profile(request):
    officer, created = Officer.objects.get_or_create(id=1)

    # ✅ only update text fields IF provided
    if request.data.get('name') is not None:
        officer.name = request.data.get('name')

    if request.data.get('email') is not None:
        officer.email = request.data.get('email')

    if request.data.get('phone') is not None:
        officer.phone = request.data.get('phone')

    if request.data.get('position') is not None:
        officer.position = request.data.get('position')

    if request.data.get('school_year') is not None:
        officer.school_year = request.data.get('school_year')

    # ✅ PROFILE IMAGE ONLY
    if 'profile_image' in request.FILES:
        officer.profile_image = request.FILES['profile_image']

    officer.save()

    return Response({
        "message": "Profile updated successfully",
        "profile_image": request.build_absolute_uri(officer.profile_image.url) if officer.profile_image else None
    })

@api_view(['POST'])
def update_sidebar_image(request):
    officer, created = Officer.objects.get_or_create(id=1)

    if 'sidebar_image' in request.FILES:
        officer.sidebar_image = request.FILES['sidebar_image']
        officer.save(update_fields=['sidebar_image'])

        return Response({
            "message": "Sidebar image updated",
            "sidebar_image": request.build_absolute_uri(officer.sidebar_image.url)
        })

    return Response({"error": "No image uploaded"}, status=400)

@api_view(['POST'])
def upload_attendance(request):
    file = request.FILES.get("file")
    event = request.data.get("event", "").strip().upper()
    date = request.data.get("date")
    time_type = request.data.get("time")
    semester = request.data.get("semester")

    if not file or not event or not date or not time_type or not semester:
        return Response({"error": "Missing fields"}, status=400)

    # ✅ READ EXCEL
    df = pd.read_excel(file, dtype=str).fillna("")

    print("=== RAW EXCEL DATA ===")
    print(df.head())
    print("COLUMNS:", df.columns.tolist())

    # ✅ NORMALIZE FUNCTION (SAFE VERSION)
    def normalize_name(name):
        if not name:
            return ""

        import unicodedata
        import re

        name = str(name).upper().strip()

        # remove accents (Ñ → N)
        name = unicodedata.normalize("NFKD", name)
        name = "".join(c for c in name if not unicodedata.combining(c))

        # clean spaces only (DO NOT remove letters!)
        name = re.sub(r'\s+', ' ', name)

        return name

    # ✅ DETECT LAST NAME COLUMN (STRONG VERSION)
    last_col = None
    for col in df.columns:
        col_clean = col.lower().replace(" ", "")
        if "lastname" in col_clean:
            last_col = col

    print("DETECTED LAST COLUMN:", last_col)

    if not last_col:
        return Response({"error": "No last name column found"}, status=400)

    # ✅ GET PRESENT LAST NAMES
    present_lastnames = set()

    for _, row in df.iterrows():
        last_name = str(row[last_col]).strip()
        clean = normalize_name(last_name)

        print("EXCEL:", last_name, "→", clean)

        if clean:
            present_lastnames.add(clean)

    print("FINAL SET:", present_lastnames)

    # 🔥 DELETE DUPLICATES (IMPORTANT)
    Attendance.objects.filter(
        event=event,
        date=date,
        time_type=time_type,
        semester=semester
    ).delete()

    masterlist = Member.objects.filter(semester=semester)

    present = []
    absent = []

    # 🔁 LOOP STUDENTS
    for student in masterlist:
        raw_lastname = student.name.split(",")[0]
        student_lastname = normalize_name(raw_lastname)

        print("CHECK:", student_lastname, "IN", present_lastnames)

        is_present = student_lastname in present_lastnames

        if is_present:
            present.append(student.name)

            Attendance.objects.create(
                student_id=student.id,
                full_name=student.name,
                event=event,
                date=date,
                time_type=time_type,
                semester=semester,
                status="present"
            )

        else:
            absent.append(student.name)

            Attendance.objects.create(
                student_id=student.id,
                full_name=student.name,
                event=event,
                date=date,
                time_type=time_type,
                semester=semester,
                status="absent"
            )

            # ✅ SAVE FILE RECORD
    AttendanceFile.objects.create(
    file=file,
    event=event,
    date=date,
    time_type=time_type,
    semester=semester
)

    return Response({
        "present_count": len(present),
        "absent_count": len(absent)
    })

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Member, Attendance

@api_view(['GET'])
def attendance_summary(request):
    semester = request.GET.get("semester")

    print("FILTER SEMESTER:", semester)

    members = Member.objects.filter(semester=semester)
    data = []

    for m in members:

        # 🔥 COUNT DISTINCT EVENTS WHERE ABSENT
        absences = Attendance.objects.filter(
    student_id=m.id,
    semester=semester,
    status="absent"
).values("event", "date").distinct().count()

        data.append({
    "id": m.id,
    "name": safe_display_name(m.name),
    "year": m.year,

    "membership": (
        "PAID"
        if m.payment_status == "PAID"
        else "UNPAID"
    ),

    "absences": absences
})

    return Response(data)

@api_view(['GET'])
def student_attendance_details(request, student_id):
    semester = request.GET.get("semester")

    records = Attendance.objects.filter(
        student_id=student_id,
        semester=semester   # 🔥 ADD THIS
    )

    data = []

    for r in records:
        data.append({
            "event": r.event,
            "date": r.date,
            "time": r.time_type,
            "status": r.status
        })

    return Response(data)

@api_view(['GET'])
def get_members(request):
    user = request.user

    # 🔥 try to get user's organization
    org = None

    if user.is_authenticated:
        # owner
        org = get_user_org(request.user)

        # joined
        if not org:
            join = JoinRequest.objects.filter(user=user, status="accepted").first()
            if join:
                org = join.organization

    # 🔥 SAFE FALLBACK (DO NOT BREAK OLD DATA)
    if org:
        members = Member.objects.filter(organization=org)
    else:
        members = Member.objects.all()   # 👈 fallback to old behavior

    data = []
    for m in members:
        data.append({
            "id": m.id,
            "name": m.name,
            "email": m.email,
            "role": m.role,
            "status": m.status,
            "contact": m.contact,
            "image": request.build_absolute_uri(m.image.url) if m.image else None,
            "year": m.year,
            "course": m.course,
            "sex": m.sex,
            "semester": m.semester,
            "year_level": m.year_level,
        })

    return Response(data)

@api_view(['POST'])
def save_member(request):
    user = request.user
    org = get_user_org(user)

    member_id = request.POST.get("id")

    if member_id:
        member = Member.objects.get(id=member_id)
    else:
        member = Member()

    member.name = request.POST.get("name")
    member.email = request.POST.get("email")
    member.role = request.POST.get("role")
    member.status = request.POST.get("status")
    member.contact = request.POST.get("contact")
    year = request.POST.get("year")
    member.year_level = request.POST.get("year_level")

    print("🔥 YEAR RECEIVED:", year)  # DEBUG

    member.year = year if year else "2026"  # ✅ IMPORTANT
    member.organization = org

    if 'image' in request.FILES:
        member.image = request.FILES['image']

    member.save()

    return Response({"success": True})

@api_view(['POST'])
def delete_member(request):
    member_id = request.data.get("id")

    try:
        member = Member.objects.get(id=member_id)
        member.delete()
        return Response({"success": True})
    except Member.DoesNotExist:
        return Response({"success": False, "error": "Member not found"})

from .models import Event


# GET EVENTS
@api_view(['GET'])
def get_events(request):
    events = Event.objects.all()

    data = []
    for e in events:
        data.append({
            "id": e.id,
            "title": e.title,
            "description": e.description,
            "date": e.date,
            "start_time": e.start_time,
            "end_time": e.end_time,
            "location": e.location
        })

    return Response(data)


# SAVE EVENT
@api_view(['POST'])
def save_event(request):
    event_id = request.data.get("id")

    if event_id:
        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            event = Event()
    else:
        event = Event()

    event.title = request.data.get("title")
    event.description = request.data.get("description")
    event.date = request.data.get("date")
    event.start_time = request.data.get("start_time")
    event.end_time = request.data.get("end_time")
    event.location = request.data.get("location")

    event.save()

    Notification.objects.create(
    message=f"New event created: {event.title}"
)

    return Response({"message": "Event saved successfully"})

from .models import Event

@api_view(['POST'])
def delete_event(request):
    event_id = request.data.get("id")

    try:
        event = Event.objects.get(id=event_id)
        event.delete()
        return Response({"message": "Deleted successfully"})
    except Event.DoesNotExist:
        return Response({"error": "Event not found"})
    
@api_view(['GET'])
def get_tasks(request):
    tasks = Task.objects.all().order_by('-created_at')

    data = []
    for t in tasks:
        data.append({
            "id": t.id,
            "title": t.title
        })

    return Response(data)


# ADD TASK
@api_view(['POST'])
def add_task(request):
    title = request.data.get("title")

    task = Task.objects.create(title=title)

    return Response({
        "id": task.id,
        "title": task.title
    })


# DELETE TASK
@api_view(['POST'])
def delete_task(request):
    task_id = request.data.get("id")

    Task.objects.filter(id=task_id).delete()

    return Response({"message": "deleted"})

@api_view(['POST'])
def upload_masterlist(request):
    term = request.data.get("semester")
    if not term:
        return Response({"error": "Semester is required"}, status=400)

    print("SEMESTER RECEIVED:", term)
    students = request.data.get("students", [])

    # 🔥 PREVENT DUPLICATES
    Member.objects.filter(semester=term).delete()

    created = []

    for s in students:
        org = get_user_org(request.user) 

        member = Member.objects.create(
            name=s.get("name"),
            email="",
            role="STUDENT",
            status="ACTIVE",

            year=s.get("year"),
            course=s.get("course", "BSIT"),
            sex=s.get("sex", ""),

            semester=term,
            organization=org   
        )

        created.append(member.name)

    return Response({
        "message": "Masterlist saved successfully",
        "count": len(created)
    })

@api_view(['GET'])
def get_school_years(request):
    years = SchoolYear.objects.all()

    data = []
    for y in years:
        data.append(y.name)

    return Response(data)



# ADD YEAR
@api_view(['POST'])
def add_school_year(request):
    name = request.data.get("name")

    if name and not SchoolYear.objects.filter(name=name).exists():
        SchoolYear.objects.create(name=name)

    return Response({"message": "Added"})


# DELETE YEAR
@api_view(['POST'])
def delete_school_year(request):

    year = request.data.get("year")

    if not year:
        return Response({"error": "No year provided"}, status=400)

    SchoolYear.objects.filter(name=year).delete()

    Member.objects.filter(
        semester__icontains=year
    ).delete()

    return Response({"success": True})

@api_view(['POST'])
def delete_masterlist(request):
    term = request.data.get("semester")

    print("DELETE REQUEST FOR:", term)  # DEBUG

    Member.objects.filter(semester=term).delete()

    return Response({"message": "Deleted successfully"})

@api_view(['GET'])
def get_attendance_files(request):

    semester = request.GET.get("semester")

    files = AttendanceFile.objects.filter(semester=semester).order_by('-uploaded_at')

    data = []

    for f in files:
        data.append({
            "id": f.id,
            "file": request.build_absolute_uri(f.file.url),
            "name": f.file.name.split("/")[-1],
            "event": f.event,
            "date": f.date,
            "time_type": f.time_type
        })

    return Response(data)

@api_view(['GET'])
def search_attendance(request):

    name = request.GET.get("name")
    semester = request.GET.get("semester")

    records = Attendance.objects.filter(
        full_name__icontains=name,
        semester=semester,
        status="ABSENT"
    )

    total_absences = records.count()

    grouped = {}

    for r in records:
        key = f"{r.date} ({r.event})"

        if key not in grouped:
            grouped[key] = []

        grouped[key].append(r.time_type)

    result = []

    for k, v in grouped.items():
        result.append({
            "event": k,
            "times": v
        })

    return Response({
        "name": name,
        "total": total_absences,
        "records": result
    })

@api_view(['GET'])
def attendance_table(request):

    semester = request.GET.get("semester")

    members = Member.objects.filter(semester=semester)
    records = Attendance.objects.filter(semester=semester)

    # 🔥 GET UNIQUE EVENTS + TIME TYPES
    columns = set()

    for r in records:
        columns.add(f"{r.event} {r.time_type}")

    columns = sorted(list(columns))

    table = []

    for m in members:

        student_data = {
            "name": m.name,
            "year": m.year,
            "columns": {},
            "absent_count": 0,
            "membership": "PAID"  # you can change later
        }

        for col in columns:
            student_data["columns"][col] = "✔"  # default present

        student_records = records.filter(full_name=m.name)

        for r in student_records:
            key = f"{r.event} {r.time_type}"

            if r.status == "ABSENT":
                student_data["columns"][key] = "❌"
                student_data["absent_count"] += 1

        table.append(student_data)

    return Response({
        "columns": columns,
        "data": table
    })





@api_view(['GET'])
def get_files(request):
    files = FileResource.objects.all().order_by('-uploaded_at')  # ✅ ALL FILES

    data = []
    for f in files:
        data.append({
            "id": f.id,
            "name": f.name,
            "size": f.size,
            "owner": f.owner,
            "date": f.uploaded_at.strftime("%b %d, %Y"),
            "file": request.build_absolute_uri(f.file.url),

            # 🔥 OPTIONAL (VERY USEFUL)
            "folder_id": f.folder.id if f.folder else None,
            "folder_name": f.folder.name if f.folder else "Main"
        })

    return Response(data)

@api_view(['POST'])
def delete_file(request):
    file_id = request.data.get("id")

    FileResource.objects.filter(id=file_id).delete()

    return Response({"message": "Deleted"})

@api_view(['GET'])
def get_folders(request):
    folders = Folder.objects.all()

    data = []
    for f in folders:
        data.append({
            "id": f.id,
            "name": f.name
        })

    return Response(data)

@api_view(['POST'])
def add_folder(request):
    name = request.data.get("name")

    folder = Folder.objects.create(name=name)

    return Response({
        "id": folder.id,
        "name": folder.name
    })


@api_view(['GET'])
def get_files_by_folder(request, folder_id):
    files = FileResource.objects.filter(folder_id=folder_id)

    data = []
    for f in files:
        data.append({
            "id": f.id,
            "name": f.name,
            "size": f.size,
            "owner": f.owner,
            "date": f.uploaded_at.strftime("%b %d, %Y"),
            "file": request.build_absolute_uri(f.file.url)
        })

    return Response(data)

@api_view(['POST'])
def upload_file(request):
    file = request.FILES.get("file")
    folder_id = request.POST.get("folder_id")

    FileResource.objects.create(
        file=file,
        name=file.name,
        size=str(round(file.size / 1024 / 1024, 2)) + " MB",
        owner="Admin",
        folder_id=folder_id if folder_id else None  # 🔥 KEY FIX
    )

    return Response({"message": "Uploaded"})

@api_view(['POST'])
def rename_folder(request):
    folder_id = request.data.get("id")
    name = request.data.get("name")

    Folder.objects.filter(id=folder_id).update(name=name)

    return Response({"message": "Renamed"})

@api_view(['POST'])
def delete_folder(request):
    folder_id = request.data.get("id")

    Folder.objects.filter(id=folder_id).delete()

    return Response({"message": "Deleted"})

@api_view(['POST'])
def rename_file(request):
    file_id = request.data.get("id")
    name = request.data.get("name")

    FileResource.objects.filter(id=file_id).update(name=name)

    return Response({"message": "Renamed"})

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)

    if user is not None:
        login(request, user)
        request._request.session.save()

        return Response({"success": True})
    else:
        return Response({
            "success": False,
            "error": "Invalid credentials"
        })

@api_view(['POST'])
def logout_user(request):
    logout(request)
    return Response({"success": True})


from .models import Organization

@api_view(['GET'])
def get_code(request):
    if not request.user.is_authenticated:
        return Response({"error": "User not logged in"}, status=401)

    org = Organization.objects.filter(owner=request.user).first()

    # 🔥 AUTO CREATE SYSTEM IF NONE
    if not org:
        org = Organization.objects.create(
            name=f"{request.user.username}'s System",
            owner=request.user
        )

    return Response({
        "code": org.code
    })

@api_view(['POST'])
def join_code(request):
    code = request.data.get("code")

    try:
        org = Organization.objects.get(code=code)

        JoinRequest.objects.create(
            user=request.user,
            organization=org
        )

        return Response({"message": "Request sent"})
    except Organization.DoesNotExist:
        return Response({"error": "Invalid code"})
    
@api_view(['GET'])
def get_requests(request):

    # ✅ FIX ANONYMOUS USER ERROR
    if not request.user.is_authenticated:
        return Response(
            {"error": "User not authenticated"},
            status=401
        )

    org = Organization.objects.filter(
        owner=request.user
    ).first()

    requests = JoinRequest.objects.filter(
        organization=org,
        status="pending"
    )

    data = []

    for r in requests:
        data.append({
            "id": r.id,
            "username": r.user.username
        })

    return Response(data)

@api_view(['POST'])
def handle_request(request):
    req_id = request.data.get("id")
    action = request.data.get("action")

    req = JoinRequest.objects.get(id=req_id)

    if action == "accept":
        req.status = "accepted"
    else:
        req.status = "rejected"

    req.save()

    return Response({"message": "Updated"})

from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import login
import json

@csrf_exempt
def register_user(request):
    if request.method == "POST":
        data = json.loads(request.body)

        username = data.get("username")
        password = data.get("password")
        email = data.get("email")

        if User.objects.filter(username=username).exists():
            return JsonResponse({
                "success": False,
                "error": "Username already exists"
            })

        user = User.objects.create_user(
            username=username,
            password=password,
            email=email
        )

        # ✅ create system
        org = Organization.objects.create(
            name=f"{username}'s System",
            owner=user
        )

        # ✅ login user
        login(request, user)

        return JsonResponse({
            "success": True,
            "code": org.code
        })

@api_view(['POST'])
def delete_attendance_record(request):
    student_id = request.data.get("student_id")
    event = request.data.get("event")
    date = request.data.get("date")
    time = request.data.get("time")

    Attendance.objects.filter(
        student_id=student_id,
        event=event,
        date=date,
        time_type=time
    ).delete()

    return Response({"success": True})

@api_view(['POST'])
def delete_all_attendance(request):
    print("🔥 DELETE ALL TRIGGERED")

    Attendance.objects.all().delete()
    AttendanceFile.objects.all().delete()

    return Response({"message": "All deleted"})

@api_view(['POST'])
def delete_attendance_file(request):
    file_id = request.data.get("id")

    try:
        file = AttendanceFile.objects.get(id=file_id)

        # 🔥 DELETE RELATED ATTENDANCE RECORDS
        Attendance.objects.filter(
            event=file.event,
            date=file.date,
            time_type=file.time_type,
            semester=file.semester
        ).delete()

        # 🔥 DELETE FILE RECORD
        file.delete()

        return Response({"success": True})

    except AttendanceFile.DoesNotExist:
        return Response({"error": "File not found"}, status=404)
    
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie

@ensure_csrf_cookie
def get_csrf(request):
    return JsonResponse({"message": "CSRF cookie set"})

from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def reset_password(request):
    username = request.data.get("username")
    new_password = request.data.get("new_password")

    try:
        user = User.objects.get(username=username)
        user.set_password(new_password)  # 🔥 IMPORTANT
        user.save()

        return Response({"success": True})
    except User.DoesNotExist:
        return Response({"success": False, "error": "User not found"})
    
    
def get_user_org(user):
    if not user or not user.is_authenticated:
        return None

    # ✅ 1. Check if user owns a system
    org = Organization.objects.filter(owner=user).first()

    # ✅ 2. If not, check joined system
    if not org:
        join = JoinRequest.objects.filter(user=user, status="accepted").first()
        if join:
            org = join.organization

    # ✅ 3. If STILL none → CREATE NEW SYSTEM
    if not org:
        org = Organization.objects.create(
            name=f"{user.username}'s System",
            owner=user
        )

    return org

@api_view(['GET'])
def membership_data(request):
    semester = request.GET.get("semester")

    org = get_user_org(request.user)

    if semester:
     members = Member.objects.filter(
        organization=org,
        semester=semester
    )
    else:
        members = Member.objects.filter(organization=org)

    total_collected = sum(m.amount_paid for m in members)
    paid = members.filter(payment_status="PAID").count()
    unpaid = members.filter(payment_status="UNPAID").count()

    data = []

    for m in members:
        data.append({
            "id": m.id,
            "name": m.name,
            "year": m.year,
            "status": m.payment_status,
            "amount": m.amount_paid
        })

    return Response({
        "total": total_collected,
        "paid": paid,
        "unpaid": unpaid,
        "students": data
    })

@api_view(['POST'])
def update_payment(request):
    student_id = request.data.get("id")
    status = request.data.get("status")
    amount = request.data.get("amount")

    org = get_user_org(request.user)

    member = Member.objects.get(id=student_id, organization=org)

    member.payment_status = status
    member.amount_paid = amount
    member.save()

    return Response({"success": True})

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import SchoolYear

@api_view(['GET'])
def get_school_years(request):
    years = SchoolYear.objects.all().order_by('name')
    return Response([y.name for y in years])


@api_view(['POST'])
def add_school_year(request):
    name = request.data.get("name")

    if not name:
        return Response({"error": "No year provided"}, status=400)

    obj, created = SchoolYear.objects.get_or_create(name=name)

    return Response({
        "message": "Year added",
        "year": obj.name
    })

from django.contrib.auth.models import User

@api_view(["POST"])
@permission_classes([AllowAny])
def change_password(request):

    username = request.data.get("username")

    current_password = request.data.get("current_password")

    new_password = request.data.get("new_password")

    try:

        user = User.objects.get(username=username)

    except User.DoesNotExist:

        return Response(
            {"error": "User not found"},
            status=404
        )

    # CHECK CURRENT PASSWORD
    if not user.check_password(current_password):

        return Response(
            {"error": "Current password is incorrect"},
            status=400
        )

    # SAVE NEW PASSWORD
    user.set_password(new_password)

    user.save()

    return Response({
        "message": "Password changed successfully"
    })