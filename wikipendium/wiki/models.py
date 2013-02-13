from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
import urllib2, urllib
from markdown2 import markdown
import simplejson as json
from wikipendium.wiki.langcodes import LANGUAGE_NAMES

# Create your models here.

class Article(models.Model):
    slug = models.SlugField(max_length=256, unique=True)
    def __unicode__(self):
        return self.slug

    def save(self):
        self.slug = self.slug.upper()
        super(Article,self).save()

    def clean(self):
        if '/' in self.slug:
            raise ValidationError('Course code cannot contain slashes')

    def get_contributors(self,lang):
        return set([ac.edited_by for ac in ArticleContent.objects.filter(article=self, lang=lang)])

    def get_newest_content(self, lang='en'):
        return ArticleContent.objects.filter(article=self, lang=lang).order_by('-updated')[:1].get()

    def get_sorted_contents(self, lang='en'):
        return ArticleContent.objects.filter(article=self, lang=lang).order_by('-updated')

    def get_available_languages(self, current=None):
        codes = ArticleContent.objects.filter(article=self).exclude(lang=current.lang).distinct().values_list('lang', flat=True)
        if codes:
            return dict(zip(map(lambda key: LANGUAGE_NAMES[key], codes), map(self.get_url, codes) ))

    def get_url(self, lang="en"):
        return self.get_newest_content(lang).get_url()


class ArticleContent(models.Model):
    article = models.ForeignKey('Article')
    content = models.TextField() 
    title = models.CharField(max_length=1024)
    lang = models.CharField(max_length=2, default='en')
    updated = models.DateTimeField(auto_now=True, auto_now_add=True)
    edited_by = models.ForeignKey(User, blank=True, null=True)

    def clean(self):
        if '/' in self.title:
            raise ValidationError('Title cannot contain slashes')
    
    def get_contributors(self):
        return set([ac.edited_by for ac in ArticleContent.objects.filter(article=self.article, lang=self.lang, updated__lt=self.updated)]) | set([self.edited_by])

    def get_full_title(self):
        return self.article.slug+': '+self.title

    def get_url(self):
        lang = ""
        if self.lang != "en":
            lang = '/' + self.lang + '/'
        return '/'+self.article.slug + ":" + self.title.replace(' ','_') + lang

    def get_edit_url(self):
        return (self.get_url() + '/edit/').replace('//','/')
    
    def get_history_url(self):
        return (self.get_url() + '/history/').replace('//','/')

    def get_history_single_url(self):
        return self.get_history_url() + str(self.pk)+'/'

    def get_language(self):
        data = {
            'q': self.content.encode('utf-8'),
            'key': '21f18e409617475159ef7d5a7084d40c'
            }
        language_json = urllib2.urlopen('http://ws.detectlanguage.com/0.2/detect', urllib.urlencode(data))
        language_info = json.loads(language_json.read())
        print language_info
        language_code = language_info["data"]["detections"][0]["language"]
        return language_code

    def get_html_content(self):
        return markdown(self.content, extras=["toc", "wiki-tables"], safe_mode=True)

    def save(self, lang=None):
        if not self.pk and not lang:
            self.lang = self.get_language()
        super(ArticleContent,self).save()

    def __unicode__(self):
        return self.title
