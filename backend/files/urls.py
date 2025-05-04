from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from .views import FileViewSet
from .search_views import SearchView, MetaInfoView

router = DefaultRouter()
router.register(r'files', FileViewSet, basename='files')

urlpatterns = [
    path('', include(router.urls)),
    re_path(r'^search/?$', SearchView.as_view()),
    re_path(r'^meta-info/?$', MetaInfoView.as_view()),
]