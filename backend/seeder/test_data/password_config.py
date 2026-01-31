import os
from pathlib import Path

from dotenv import load_dotenv

current_dir = Path(__file__).parent
password_env_path = current_dir / 'password_config.env'

if not password_env_path.exists():
    raise FileNotFoundError(
        f'Password configuration file not found: {password_env_path}\n'
        f'Please copy password_config.env.example to password_config.env and fill in the passwords.'
    )

load_dotenv(password_env_path)

# 使用者名稱到環境變數的對應
USERNAME_TO_ENV_VAR = {
    'teacherA': 'TEACHER_A_PASSWORD',
    'teacherB': 'TEACHER_B_PASSWORD',
    'teacherC': 'TEACHER_C_PASSWORD',
    'teacherD': 'TEACHER_D_PASSWORD',
    'teacherE': 'TEACHER_E_PASSWORD',
    'assistantA': 'ASSISTANT_A_PASSWORD',
    'assistantB': 'ASSISTANT_B_PASSWORD',
    'assistantC': 'ASSISTANT_C_PASSWORD',
    'assistantD': 'ASSISTANT_D_PASSWORD',
    'studentA': 'STUDENT_A_PASSWORD',
    'studentB': 'STUDENT_B_PASSWORD',
    'studentC': 'STUDENT_C_PASSWORD',
    'studentD': 'STUDENT_D_PASSWORD',
    'studentE': 'STUDENT_E_PASSWORD',
    'studentF': 'STUDENT_F_PASSWORD',
    'studentG': 'STUDENT_G_PASSWORD',
    'studentH': 'STUDENT_H_PASSWORD',
    'studentI': 'STUDENT_I_PASSWORD',
    'studentJ': 'STUDENT_J_PASSWORD',
    'studentK': 'STUDENT_K_PASSWORD',
    'studentL': 'STUDENT_L_PASSWORD',
}


def get_password(username):
    env_var = USERNAME_TO_ENV_VAR.get(username)

    if not env_var:
        raise ValueError(f'Unknown username: {username}')

    password = os.getenv(env_var)

    if not password:
        raise ValueError(
            f'Password not set for {username} (environment variable: {env_var})\n'
            f'Please check your password_config.env file.'
        )

    return password
