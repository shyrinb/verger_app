from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
import logging

logger = logging.getLogger(__name__)

class UtilisateurAPIBackend(ModelBackend):
    
    def authenticate(self, request, username=None, password=None, **kwargs):
        logger.debug(f'Tentative de connexion avec le nom d\'utilisateur: {username}')

        UserModel = get_user_model()

        try:
            user = UserModel._default_manager.get_by_natural_key(username)
        except UserModel.DoesNotExist:
            return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user
