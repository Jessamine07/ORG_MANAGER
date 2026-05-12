from django.urls import path
from .views import add_folder, add_school_year, add_task, attendance_summary, attendance_table, change_password, clear_notifications, delete_all_attendance, delete_attendance_file, delete_attendance_record, delete_folder, delete_masterlist, delete_school_year, delete_task, get_attendance_files, get_csrf, get_files_by_folder, get_folders, get_members, get_requests, get_school_years, get_tasks, handle_request, membership_data, register_user, rename_file, rename_folder, reset_password, search_attendance, student_attendance_details, update_payment, update_sidebar_image, upload_attendance, get_notifications, dashboard_stats, upload_masterlist
from .views import get_profile, update_profile
from django.conf import settings
from django.conf.urls.static import static
from .views import get_members, save_member, delete_member
from .views import get_events, save_event
from .views import delete_event
from .views import get_files, upload_file, delete_file
from .views import login_user, logout_user
from .views import get_code, join_code


urlpatterns = [
    
    path('upload/', upload_attendance),
    path('notifications/', get_notifications),
    path('dashboard/', dashboard_stats),

    path('profile/', get_profile),
    path('profile/update/', update_profile),

    # 🔥 MEMBERS CRUD
    path('members/', get_members),
    path('members/save/', save_member),
    path('members/delete/', delete_member),
    path('events/', get_events),
    path('events/save/', save_event),
    path('events/delete/', delete_event),
    path('notifications/clear/', clear_notifications),
    
    path('tasks/', get_tasks),
path('tasks/add/', add_task),
path('tasks/delete/', delete_task),
path('masterlist/upload/', upload_masterlist),
path('schoolyears/', get_school_years),
path('schoolyears/add/', add_school_year),
path('schoolyears/delete/', delete_school_year),
path('masterlist/delete/', delete_masterlist),
path('attendance/files/', get_attendance_files),
path('attendance/search/', search_attendance),
path('files/', get_files),
path('files/upload/', upload_file),
path('files/delete/', delete_file),
path('folders/', get_folders),
path('folders/add/', add_folder),
path('files/<int:folder_id>/', get_files_by_folder),
path('folders/rename/', rename_folder),
path('folders/delete/', delete_folder),
path('files/rename/', rename_file),
path('login/', login_user),
path('logout/', logout_user),
path('get-code/', get_code),
path('join-code/', join_code),
path('requests/', get_requests),
path('requests/handle/', handle_request),
path('register/', register_user),
path('attendance/summary/', attendance_summary),
path('attendance/details/<int:student_id>/', student_attendance_details),
path('attendance/delete/', delete_attendance_record),
path('attendance/delete-all/', delete_all_attendance),
path('attendance/file/delete/', delete_attendance_file),
path('profile/sidebar-image/', update_sidebar_image),
path('csrf/', get_csrf),
path('reset-password/', reset_password),
path('membership/', membership_data),
path('membership/update/', update_payment),
path('schoolyears/', get_school_years),
path('schoolyears/add/', add_school_year),
path('schoolyears/delete/', delete_school_year),
path("change-password/", change_password),






]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)