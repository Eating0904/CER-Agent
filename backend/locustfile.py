"""
Locust API 壓力測試腳本
模擬 100 位使用者同時操作系統，檢測系統在高併發情況下是否會卡頓

先決條件：
1. 教師帳號需直接操作 Model 建立（username: teacher_test, password: test123456, role: teacher）

執行方式：
# Web UI 模式
locust -f locustfile.py

# 無 UI 模式（100 使用者，每秒產生 10 人，執行 5 分鐘）
locust -f locustfile.py --headless --users 100 --spawn-rate 10 --run-time 5m
"""

from datetime import datetime, timedelta

from locust import HttpUser, SequentialTaskSet, between, events, task

# ============================================================
# 設定區域 - 請根據環境修改
# ============================================================
BASE_URL = ""
TEACHER_USERNAME = ""
TEACHER_PASSWORD = ""

# ============================================================
# 全域變數 - 由 setup 階段初始化
# ============================================================
TEMPLATE_ID = None


def ensure_api_prefix(endpoint: str) -> str:
    """確保 endpoint 有 /api/ 前綴（必須以 / 開頭，Locust 要求）"""
    # 移除開頭的 / 和 api/ 進行正規化
    endpoint = endpoint.lstrip("/")
    if endpoint.startswith("api/"):
        endpoint = endpoint[4:]  # 移除 "api/"
    return f"/api/{endpoint}"


@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    """
    測試開始前的設置：
    1. 使用教師帳號登入
    2. 檢查/建立測試模板
    """
    global TEMPLATE_ID

    print("\n" + "=" * 60)
    print("🚀 壓力測試初始化")
    print("=" * 60)

    # 使用 requests 直接呼叫 API 進行設置（避免 Locust HttpSession 的問題）
    import requests

    session = requests.Session()
    host = environment.host if environment.host else BASE_URL

    print(f"🌐 目標 Host: {host}")

    # 1. 教師登入
    print("\n📝 步驟 1: 教師帳號登入")
    login_url = f"{host}/{ensure_api_prefix('user/login/')}"
    login_response = session.post(
        login_url,
        json={"username": TEACHER_USERNAME, "password": TEACHER_PASSWORD},
    )

    if login_response.status_code != 200:
        print(f"❌ 教師登入失敗: {login_response.text}")
        print("請確認教師帳號已建立（需直接操作 Model）")
        raise Exception("Teacher login failed")

    token = login_response.json().get("access")
    session.headers.update({"Authorization": f"Bearer {token}"})
    print("✅ 教師登入成功")

    # 2. 檢查是否有現有模板
    print("\n📝 步驟 2: 檢查/建立測試模板")
    templates_url = f"{host}/{ensure_api_prefix('mind-map-template/my/')}"
    templates_response = session.get(templates_url)

    templates = templates_response.json()
    stress_test_template = None

    # 尋找壓力測試專用模板
    for template in templates:
        if template.get("name", "").startswith("[壓力測試]"):
            stress_test_template = template
            break

    if stress_test_template:
        TEMPLATE_ID = stress_test_template["id"]
        print(f"✅ 找到現有測試模板: {stress_test_template['name']} (ID: {TEMPLATE_ID})")
    else:
        # 建立新模板
        yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        next_month = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")

        template_data = {
            "name": f"[壓力測試] 自動建立模板 {datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "issue_topic": "這是壓力測試用的議題",
            "article_content": "這是壓力測試用的文章內容。" * 20,
            "start_date": yesterday,
            "end_date": next_month,
        }

        create_url = f"{host}/{ensure_api_prefix('mind-map-template/')}"
        create_response = session.post(create_url, json=template_data)

        if create_response.status_code not in [200, 201]:
            print(f"❌ 建立模板失敗: {create_response.text}")
            raise Exception("Template creation failed")

        TEMPLATE_ID = create_response.json().get("id")
        print(f"✅ 建立新測試模板 (ID: {TEMPLATE_ID})")

    print("\n" + "=" * 60)
    print(f"🎯 使用模板 ID: {TEMPLATE_ID}")
    print("=" * 60 + "\n")


class StudentTaskSet(SequentialTaskSet):
    """
    模擬學生使用者的完整操作流程
    使用 SequentialTaskSet 確保任務依序執行
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.username = None
        self.refresh_token = None
        self.map_id = None
        self.user_action_id = None

    # ============================================================
    # Phase 1: 帳號註冊與登入
    # ============================================================
    @task
    def register_account(self):
        """註冊新帳號"""
        import uuid

        unique_id = uuid.uuid4().hex[:12]  # 使用 UUID 前 12 碼確保唯一性
        self.username = f"stress_{unique_id}"

        response = self.client.post(
            ensure_api_prefix("user/register/"),
            json={
                "username": self.username,
                "email": f"{self.username}@test.com",
                "password": "test123456",
            },
            name="POST /user/register/",
        )

        if response.status_code not in [200, 201]:
            self.user.environment.runner.quit()

    @task
    def login(self):
        """登入帳號"""
        response = self.client.post(
            ensure_api_prefix("user/login/"),
            json={"username": self.username, "password": "test123456"},
            name="POST /user/login/",
        )

        if response.status_code == 200:
            data = response.json()
            token = data.get("access")
            self.refresh_token = data.get("refresh")
            self.client.headers.update({"Authorization": f"Bearer {token}"})

    @task(5)  # 權重 5：每輪執行 5 次，模擬定期刷新
    def refresh_access_token(self):
        """刷新 access token"""
        if self.refresh_token:
            response = self.client.post(
                ensure_api_prefix("user/refresh/"),
                json={"refresh": self.refresh_token},
                name="POST /user/refresh/",
            )

            if response.status_code == 200:
                token = response.json().get("access")
                self.client.headers.update({"Authorization": f"Bearer {token}"})

    @task
    def get_user_info(self):
        """取得使用者資訊"""
        self.client.get(
            ensure_api_prefix("user/me/"),
            name="GET /user/me/",
        )

    # ============================================================
    # Phase 2: 模板瀏覽
    # ============================================================
    @task
    def get_all_templates(self):
        """取得所有模板"""
        self.client.get(
            ensure_api_prefix("mind-map-template/"),
            name="GET /mind-map-template/",
        )

    # ============================================================
    # Phase 4: 地圖管理
    # ============================================================
    @task
    def create_map_from_template(self):
        """從模板建立地圖"""
        response = self.client.post(
            ensure_api_prefix("map/create_from_template/"),
            json={"template_id": TEMPLATE_ID},
            name="POST /map/create_from_template/",
        )

        if response.status_code in [200, 201]:
            self.map_id = response.json().get("id")

    @task
    def get_all_maps(self):
        """取得所有地圖"""
        self.client.get(
            ensure_api_prefix("map/"),
            name="GET /map/",
        )

    @task
    def get_specific_map(self):
        """取得特定地圖"""
        if self.map_id:
            self.client.get(
                ensure_api_prefix(f"map/{self.map_id}/"),
                name="GET /map/{id}/",
            )

    @task(3)  # 權重 3：每 5 分鐘一次，2hr 約 24 次
    def update_map(self):
        """更新地圖"""
        if self.map_id:
            update_data = {
                "nodes": [
                    {
                        "id": "c1",
                        "position": {"x": 100, "y": 100},
                        "data": {
                            "type": "C",
                            "content": "Stress test claim content",
                            "showDots": ["right", "bottom"],
                        },
                        "type": "baseNode",
                    }
                ],
                "edges": [],
            }
            self.client.patch(
                ensure_api_prefix(f"map/{self.map_id}/"),
                json=update_data,
                name="PATCH /map/{id}/",
            )

    # ============================================================
    # Phase 5: 文章管理
    # ============================================================
    @task
    def get_essay(self):
        """取得文章"""
        if self.map_id:
            self.client.get(
                ensure_api_prefix(f"essay/{self.map_id}/"),
                name="GET /essay/{map_id}/",
            )

    @task(3)  # 權重 3：每 5 分鐘一次，2hr 約 24 次
    def update_essay(self):
        """更新文章"""
        if self.map_id:
            self.client.put(
                ensure_api_prefix(f"essay/{self.map_id}/"),
                json={"content": "<p>這是壓力測試更新的文章內容</p>"},
                name="PUT /essay/{map_id}/",
            )

    # ============================================================
    # Phase 6: 使用者行為追蹤
    # ============================================================
    @task(12)  # 權重 12：每 1 分鐘一次，2hr 約 120 次
    def create_user_action(self):
        """記錄使用者行為"""
        response = self.client.post(
            ensure_api_prefix("user-action/"),
            json={"action_type": "chat_in_mindmap", "metadata": {"stress_test": True}},
            name="POST /user-action/",
        )

        if response.status_code in [200, 201]:
            self.user_action_id = response.json().get("id")

    # ============================================================
    # Phase 7: 聊天機器人（已註解 - LLM 相關）
    # ============================================================
    # @task
    # def mindmap_chat(self):
    #     """心智圖聊天"""
    #     if self.map_id and self.user_action_id:
    #         self.client.post(
    #             ensure_api_prefix("chatbot/mindmap/chat/"),
    #             json={
    #                 "message": "這是壓力測試的訊息",
    #                 "map_id": self.map_id,
    #                 "user_action_id": self.user_action_id,
    #             },
    #             name="POST /chatbot/mindmap/chat/",
    #         )

    # @task
    # def get_mindmap_chat_history(self):
    #     """取得心智圖聊天歷史"""
    #     if self.map_id:
    #         self.client.get(
    #             ensure_api_prefix(f"chatbot/mindmap/history/{self.map_id}/"),
    #             name="GET /chatbot/mindmap/history/{map_id}/",
    #         )

    # @task
    # def essay_chat(self):
    #     """文章聊天"""
    #     if self.map_id and self.user_action_id:
    #         self.client.post(
    #             ensure_api_prefix("chatbot/essay/chat/"),
    #             json={
    #                 "message": "這是壓力測試的文章聊天訊息",
    #                 "map_id": self.map_id,
    #                 "essay_plain_text": "這是壓力測試的純文字文章內容",
    #                 "user_action_id": self.user_action_id,
    #             },
    #             name="POST /chatbot/essay/chat/",
    #         )

    # @task
    # def get_essay_chat_history(self):
    #     """取得文章聊天歷史"""
    #     if self.map_id:
    #         self.client.get(
    #             ensure_api_prefix(f"chatbot/essay/history/{self.map_id}/"),
    #             name="GET /chatbot/essay/history/{map_id}/",
    #         )

    # ============================================================
    # Phase 8: 回饋管理（已註解 - LLM 相關）
    # ============================================================
    # @task
    # def create_feedback(self):
    #     """建立回饋"""
    #     if self.map_id:
    #         self.client.post(
    #             ensure_api_prefix("feedback/create/"),
    #             json={
    #                 "map_id": self.map_id,
    #                 "metadata": [
    #                     {
    #                         "action": "edit",
    #                         "node_id": "c1",
    #                         "node_type": "C",
    #                         "original_content": "Original content",
    #                         "updated_content": "Stress test updated content",
    #                     }
    #                 ],
    #                 "alert_title": "壓力測試操作",
    #                 "operation_details": "編輯了 1 個 C 節點",
    #             },
    #             name="POST /feedback/create/",
    #         )

    @task
    def complete_test_cycle(self):
        """完成一輪測試後，重新開始下一輪"""
        # SequentialTaskSet 執行完所有 task 後會自動從頭開始
        # 如果想要只執行一輪就停止，可以取消下面的註解
        # self.user.environment.runner.quit()
        pass


class StressTestUser(HttpUser):
    """
    壓力測試使用者
    模擬學生的完整操作流程
    """

    host = BASE_URL
    tasks = [StudentTaskSet]
    wait_time = between(1, 3)  # 每個任務之間等待 1-3 秒
