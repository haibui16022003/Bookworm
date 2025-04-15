

from app.schema.UserSchema import *

class UserController:
    @staticmethod
    def user_sign_up(user_data: UserRegister) -> UserResponse:
        pass


    @staticmethod
    def user_sign_in(user_email: str, user_password: str) -> UserResponse:
        pass


    @staticmethod
    def user_sign_out():
        pass


    @staticmethod
    def user_update(user_data: UserUpdate) -> UserResponse:
        pass
