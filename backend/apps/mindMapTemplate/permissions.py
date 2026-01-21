from rest_framework import permissions


class TemplatePermission(permissions.BasePermission):
    """
    Template 操作權限檢查：
    - Admin: 可以執行所有操作
    - Teacher: 只能操作自己建立的 template
    - Assistant: 只能操作被授權的 template
    """

    def has_permission(self, request, view):
        # 必須登入才能訪問
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user

        # Admin 擁有所有權限
        if user.role == 'admin':
            return True

        # Teacher 只能操作自己建立的 template
        if user.role == 'teacher':
            return obj.created_by == user

        # Assistant 只能 READ/UPDATE，不能 DELETE
        if user.role == 'assistant':
            has_access = obj.permissions.filter(assistant=user).exists()

            if not has_access:
                return False

            # 安全操作（GET/HEAD/OPTIONS）允許
            if request.method in permissions.SAFE_METHODS:
                return True

            # UPDATE（PUT/PATCH）允許
            if request.method in ['PUT', 'PATCH']:
                return True

            # DELETE 不允許
            if request.method == 'DELETE':
                return False

            # 其他操作預設不允許
            return False

        return False
