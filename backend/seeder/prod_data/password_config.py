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

USERNAME_TO_ENV_VAR = {
    'teacher_1': 'TEACHER_1_PASSWORD',
    'teacher_2': 'TEACHER_2_PASSWORD',
    'teacher_3': 'TEACHER_3_PASSWORD',
    'assistant_1': 'ASSISTANT_1_PASSWORD',
    'assistant_2': 'ASSISTANT_2_PASSWORD',
    'student_1': 'STUDENT_1_PASSWORD',
    'student_2': 'STUDENT_2_PASSWORD',
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
