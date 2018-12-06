# from django.db import models
from django.contrib.gis.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import Q
from django.utils.html import conditional_escape
from django.db.models import Manager

class Theme_Issue(models.Model):
    # class name exception (underscore) because ManyToManyField (see
    # Issf_Core) assumes pk is
    # lower(Table_Name) + _id
    theme_issue_id = models.AutoField(primary_key=True)
    theme_issue_category = models.TextField()
    category_order = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'theme_issue'
        ordering = ['category_order']

    def __str__(self):
        return '%s' % (self.theme_issue_category)


class Theme_Issue_Value(models.Model):
    # class name exception (underscore) because ManyToManyField (see
    # Issf_Core) assumes pk is
    # lower(Table_Name) + _id
    theme_issue_value_id = models.AutoField(primary_key=True)
    theme_issue = models.ForeignKey(Theme_Issue, on_delete=models.CASCADE)
    theme_issue_label = models.TextField()
    label_order = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'theme_issue_value'
        ordering = ['theme_issue', 'label_order']

    def __str__(self):
        return '%s' % (self.theme_issue_label)


class Country(models.Model):
    country_id = models.AutoField(primary_key=True)
    short_name = models.CharField(max_length=100)
    official_name = models.TextField(blank=True)
    iso3 = models.TextField(blank=True)
    iso2 = models.TextField(blank=True)
    undp = models.TextField(blank=True)
    uni = models.IntegerField(blank=True, null=True)
    faostat = models.IntegerField(blank=True, null=True)
    gaul = models.IntegerField(blank=True, null=True)
    country_point = models.PointField(blank=True, null=True)
    objects = models.Manager()

    class Meta:
        managed = False
        db_table = 'country'
        ordering = ['short_name']

    def __str__(self):
        return '%s' % (self.short_name)


class PublicationType(models.Model):
    publication_type_id = models.AutoField(primary_key=True)
    publication_type = models.TextField()

    class Meta:
        managed = False
        db_table = 'publication_type'
        ordering = ['publication_type_id']

    def __str__(self):
        return '%s' % (self.publication_type)


class Language(models.Model):
    language_id = models.AutoField(primary_key=True)
    iso_639_2digit_code = models.CharField(max_length=2)
    language_name = models.CharField(max_length=200)

    class Meta:
        managed = False
        db_table = 'language'
        ordering = ['language_name']

    def __str__(self):
        return '%s' % (self.language_name)


class SSFKnowledge(models.Model):
    # core (inherited from issf_core) fields
    issf_core_id = models.AutoField(primary_key=True)
    contribution_date = models.DateField(auto_now_add=True)
    contributor = models.ForeignKey(settings.AUTH_USER_MODEL,
                                    related_name='contributor+',
                                    on_delete=models.CASCADE)
    edited_date = models.DateField(auto_now=True)
    editor = models.ForeignKey(settings.AUTH_USER_MODEL,
                               related_name='editor+',
                               on_delete=models.CASCADE)
    core_record_type = models.CharField(max_length=100,
                                        default='State-of-the-Art in SSF '
                                                'Research')
    core_record_summary = models.TextField(blank=True)
    geographic_scope_type = models.CharField(max_length=100, default='Local')

    # fields on main form
    publication_type = models.ForeignKey(PublicationType,
            on_delete=models.CASCADE)
    other_publication_type = models.CharField(blank=True, max_length=50)
    level1_title = models.TextField()
    level2_title = models.TextField()
    nonenglish_language = models.ForeignKey(Language, blank=True, null=True,
            on_delete=models.CASCADE)
    nonenglish_title = models.TextField(blank=True)
    year = models.IntegerField(
        validators=[MinValueValidator(1000), MaxValueValidator(3000)])
    SSF_DEFINED = (
        ('Yes', 'Yes'), ('No', 'No'), ('Not explicitly', 'Not explicitly'))
    ssf_defined = models.CharField(choices=SSF_DEFINED, max_length=100)
    ssf_definition = models.TextField(blank=True)
    YES_NO = ((True, 'Yes'), (False, 'No'))
    lsf_considered = models.BooleanField(choices=YES_NO, default=False)
    research_method = models.TextField(blank=True)
    aim_purpose_question = models.TextField()
    solutions_offered = models.BooleanField(choices=YES_NO, default=False)
    solution_details = models.TextField(blank=True)
    explicit_implications_recommendations = models.BooleanField(choices=YES_NO,
                                                                default=False)
    implication_details = models.TextField(blank=True)
    comments = models.TextField(blank=True)

    # details associated with checkbox sets
    # note: one for each characteristic category except Ecosystem high-level
    #  type(s) and
    # Small-scale fishery term(s)
    # note: one for all themes/issues together
    # THESE DON'T APPEAR TO HAVE BEEN IMPLEMENTED - SHOULD THEY BE?
    fishery_type_details = models.TextField(blank=True)
    gear_type_details = models.TextField(blank=True)
    ecosystem_type_details = models.TextField(blank=True)
    market_details = models.TextField(blank=True)
    governance_details = models.TextField(blank=True)
    management_details = models.TextField(blank=True)
    theme_issue_details = models.TextField(blank=True)

    # checkbox sets not generalized as themes/issues or characteristics
    method_specify_qualitative = models.BooleanField(choices=YES_NO,
                                                     default=False,
                                                     help_text='Specify '
                                                               'method '
                                                               'approach ('
                                                               'check '
                                                               'all that '
                                                               'apply):')
    method_specify_quantitative = models.BooleanField(choices=YES_NO,
                                                      default=False)
    method_specify_mixed = models.BooleanField(choices=YES_NO, default=False)
    demographics_na = models.BooleanField(default=False,
                                          help_text='Demographic factors ('
                                                    'check all that apply):')
    demographics_age = models.BooleanField(default=False)
    demographics_education = models.BooleanField(default=False)
    demographics_ethnicity = models.BooleanField(default=False)
    demographics_gender = models.BooleanField(default=False)
    demographics_health = models.BooleanField(default=False)
    demographics_income = models.BooleanField(default=False)
    demographics_religion = models.BooleanField(default=False)
    demographics_unspecified = models.BooleanField(default=False)
    demographics_other = models.BooleanField(default=False)
    demographics_other_text = models.CharField(max_length=100, blank=True)
    demographic_details = models.TextField(blank=True)
    employment_na = models.BooleanField(
        default=False)
    employment_full_time = models.BooleanField(default=False)
    employment_part_time = models.BooleanField(default=False)
    employment_seasonal = models.BooleanField(default=False)
    employment_unspecified = models.BooleanField(default=False)
    employment_details = models.TextField(blank=True)
    stage_na = models.BooleanField(default=False,
                                   help_text='Stage(s) of fishery chain '
                                             'addressed (check all that '
                                             'apply)')
    stage_pre_harvest = models.BooleanField(default=False)
    stage_harvest = models.BooleanField(default=False)
    stage_post_harvest = models.BooleanField(default=False)
    stage_unspecified = models.BooleanField(default=False)

    class Meta:
        managed = False
        db_table = 'ssf_knowledge'

    def __str__(self):
        return '%s %s' % (self.level2_title, self.level1_title)

    def save(self, *args, **kwargs):
        self.level1_title = self.level1_title
        self.level2_title = self.level2_title
        self.nonenglish_title = self.nonenglish_title
        super(SSFKnowledge, self).save(*args, **kwargs)


class KnowledgeAuthor(models.Model):
    knowledge_author_id = models.AutoField(primary_key=True)
    knowledge_core = models.ForeignKey(SSFKnowledge,
            related_name='issf_core', on_delete=models.CASCADE)

    class Meta:
        managed = False
        db_table = 'knowledge_author'
        ordering = ['knowledge_author_id']


class KnowledgeAuthorSimple(models.Model):
    knowledge_author_simple_id = models.AutoField(primary_key=True)
    knowledge_core = models.ForeignKey(SSFKnowledge, on_delete=models.CASCADE)
    author_name = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'knowledge_author_simple'
        ordering = ['knowledge_author_simple_id']

    def save(self, *args, **kwargs):
        self.author_name = conditional_escape(self.author_name)
        super(KnowledgeAuthorSimple, self).save(*args, **kwargs)


class Attribute(models.Model):
    attribute_id = models.AutoField(primary_key=True)
    attribute_category = models.TextField()
    question_number = models.TextField()
    attribute_label = models.TextField()
    label_order = models.IntegerField()
    attribute_type = models.TextField()
    units_label = models.TextField()
    additional_field = models.TextField()
    additional_field_type = models.TextField()
    min_value = models.IntegerField()
    max_value = models.IntegerField()
    additional_min_value = models.IntegerField()
    additional_max_value = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'attribute'
        ordering = ['attribute_label']

    def __str__(self):
        return '%s' % (self.attribute_label)


class SSFProfile(models.Model):
    # core (inherited from issf_core) fields
    issf_core_id = models.AutoField(primary_key=True)
    contribution_date = models.DateField(auto_now_add=True)
    contributor = models.ForeignKey(settings.AUTH_USER_MODEL,
                                    related_name='contributor+',
                                    on_delete=models.CASCADE)
    edited_date = models.DateField(auto_now=True)
    editor = models.ForeignKey(settings.AUTH_USER_MODEL,
                               related_name='editor+', on_delete=models.CASCADE)
    core_record_type = models.TextField(default='SSF Profile')
    geographic_scope_type = models.CharField(max_length=100, default='Local')

    # profile-specific fields
    ssf_name = models.CharField(max_length=200)
    SSF_DEFINED = (
        ('Yes', 'Yes'), ('No', 'No'), ('Not explicitly', 'Not explicitly'))
    ssf_defined = models.CharField(choices=SSF_DEFINED, max_length=100)
    ssf_definition = models.TextField(blank=True)
    data_year = models.IntegerField(
        validators=[MinValueValidator(1000), MaxValueValidator(3000)])
    data_month = models.IntegerField(blank=True, null=True)
    data_day = models.IntegerField(blank=True, null=True,
                                   validators=[MinValueValidator(1),
                                               MaxValueValidator(31)])
    data_end_year = models.IntegerField(blank=True, null=True,
                                        validators=[MinValueValidator(1000),
                                                    MaxValueValidator(3000)])
    data_end_month = models.IntegerField(blank=True, null=True)
    data_end_day = models.IntegerField(blank=True, null=True,
                                       validators=[MinValueValidator(1),
                                                   MaxValueValidator(31)])
    comments = models.TextField(blank=True)
    sources = models.TextField(blank=True)
    percent = models.IntegerField(default=0)

    img_url = models.URLField(max_length=200, blank=True)


    class Meta:
        managed = False
        db_table = 'ssf_profile'

    def __str__(self):
        return '%s' % (self.ssf_name)


class AttributeValue(models.Model):
    attribute_value_id = models.AutoField(primary_key=True)
    attribute = models.ForeignKey(Attribute, on_delete=models.CASCADE)
    value_label = models.TextField()
    value_order = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'attribute_value'
        ordering = ['value_order']

    def __str__(self):
        return '%s' % (self.value_label)


class AdditionalValue(models.Model):
    additional_value_id = models.AutoField(primary_key=True)
    attribute = models.ForeignKey(Attribute, on_delete=models.CASCADE)
    value_label = models.TextField()
    value_order = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'additional_value'
        ordering = ['value_order']

    def __str__(self):
        return '%s' % (self.value_label)


class SSFOrganization(models.Model):
    # core (inherited from issf_core) fields
    issf_core_id = models.AutoField(primary_key=True)
    contribution_date = models.DateField(auto_now_add=True)
    contributor = models.ForeignKey(settings.AUTH_USER_MODEL,
                                    related_name='contributor+',
                                    on_delete=models.CASCADE)
    edited_date = models.DateField(auto_now=True)
    editor = models.ForeignKey(settings.AUTH_USER_MODEL,
                               related_name='editor+', on_delete=models.CASCADE)
    core_record_type = models.TextField(default='SSF Organization')
    geographic_scope_type = models.CharField(max_length=100, default='Local')

    # many-to-many with persons
    # persons = models.ManyToManyField(SSFPerson,
    # db_table='person_organization', blank=True)

    # fields on main form
    organization_name = models.CharField(max_length=100)
    year_established = models.CharField(blank=True, max_length=100)
    organization_type_union = models.BooleanField(default=False)
    organization_type_support = models.BooleanField(default=False)
    organization_type_coop = models.BooleanField(default=False)
    organization_type_flag = models.BooleanField(default=False)
    organization_type_other = models.BooleanField(default=False)
    organization_type_other_text = models.CharField(max_length=100, blank=True)
    SSF_DEFINED = (
        ('Yes', 'Yes'), ('No', 'No'), ('Not explicitly', 'Not explicitly'))
    ssf_defined = models.CharField(choices=SSF_DEFINED, max_length=100)
    ssf_definition = models.TextField(blank=True)
    motivation_voice = models.BooleanField(default=False)
    motivation_market = models.BooleanField(default=False)
    motivation_sustainability = models.BooleanField(default=False)
    motivation_economics = models.BooleanField(default=False)
    motivation_rights = models.BooleanField(default=False)
    motivation_collaboration = models.BooleanField(default=False)
    motivation_other = models.BooleanField(default=False)
    motivation_other_text = models.CharField(max_length=100, blank=True)
    mission = models.TextField(blank=True)
    activities_capacity = models.BooleanField(default=False)
    activities_sustainability = models.BooleanField(default=False)
    activities_networking = models.BooleanField(default=False)
    activities_marketing = models.BooleanField(default=False)
    activities_collaboration = models.BooleanField(default=False)
    activities_other = models.BooleanField(default=False)
    activities_other_text = models.CharField(max_length=100, blank=True)
    network_types_state = models.BooleanField(default=False)
    network_types_ssfos = models.BooleanField(default=False)
    network_types_community = models.BooleanField(default=False)
    network_types_society = models.BooleanField(default=False)
    network_types_ngos = models.BooleanField(default=False)
    network_types_other = models.BooleanField(default=False)
    network_types_other_text = models.CharField(max_length=100, blank=True)
    achievements = models.TextField(blank=True)
    success_factors = models.TextField(blank=True)
    obstacles = models.TextField(blank=True)
    address1 = models.CharField(max_length=200, blank=True)
    address2 = models.CharField(max_length=100, blank=True)
    city_town = models.CharField(max_length=100, blank=True)
    prov_state = models.CharField(max_length=100, blank=True)
    country = models.ForeignKey(Country, on_delete=models.CASCADE)
    postal_code = models.CharField(max_length=100, blank=True)
    organization_point = models.PointField(blank=True, null=True)
    objects = models.Manager()

    class Meta:
        managed = False
        db_table = 'ssf_organization'
        ordering = ['organization_name']

    def __str__(self):
        return '%s' % (self.organization_name)

    def save(self, *args, **kwargs):
        self.organization_name = conditional_escape(self.organization_name)
        self.address1 = conditional_escape(self.address1)
        self.address2 = conditional_escape(self.address2)
        super(SSFOrganization, self).save(*args, **kwargs)


class SSFPerson(models.Model):
    # core (inherited from issf_core fields) fields
    issf_core_id = models.AutoField(primary_key=True)
    contribution_date = models.DateField(auto_now_add=True)
    contributor = models.ForeignKey(settings.AUTH_USER_MODEL,
                                    related_name='contributor+',
                                    on_delete=models.CASCADE)
    edited_date = models.DateField(auto_now=True)
    editor = models.ForeignKey(settings.AUTH_USER_MODEL,
                               related_name='editor+', on_delete=models.CASCADE)
    core_record_type = models.TextField(default="Who's Who in SSF")
    geographic_scope_type = models.CharField(max_length=100, default='Local')

    # fields on main form
    affiliation = models.CharField(max_length=100, blank=True)
    address1 = models.CharField(max_length=200, blank=True)
    address2 = models.CharField(max_length=100, blank=True)
    city_town = models.CharField(max_length=100, blank=True)
    prov_state = models.CharField(max_length=100, blank=True)
    country = models.ForeignKey(Country, blank=True, null=True,
            on_delete=models.CASCADE)
    postal_code = models.CharField(max_length=100, blank=True)
    person_point = models.PointField(blank=True, null=True)
    url = models.URLField(blank=True)
    organizations = models.ManyToManyField(SSFOrganization,
                                           db_table='person_organization',
                                           blank=True, related_name='persons')

    img_url = models.URLField(max_length=200, blank=True)

    # researcher-specific fields
    YES_NO = ((True, 'Yes'), (False, 'No'))
    is_researcher = models.BooleanField(default=False, choices=YES_NO)
    number_publications = models.PositiveIntegerField(blank=True, null=True)
    EDUCATION_LEVEL = (
        ('Bachelor', 'Bachelor'), ('Master', 'Master'), ('PhD', 'PhD'),
        ('Other', 'Other'),)
    education_level = models.CharField(max_length=100, choices=EDUCATION_LEVEL,
                                       blank=True)
    other_education_level = models.CharField(max_length=100, blank=True)
    research_method = models.TextField(blank=True)
    issues_addressed = models.TextField(blank=True)
    objects = models.Manager()

    class Meta:
        managed = False
        db_table = 'ssf_person'

    def __str__(self):
        return '%s %s %s' % (
            self.contributor.first_name, self.contributor.initials,
            self.contributor.last_name)

    def save(self, *args, **kwargs):
        self.affiliation = conditional_escape(self.affiliation)
        super(SSFPerson, self).save(*args, **kwargs)


class SSFCapacityNeed(models.Model):
    # core (inherited from issf_core) fields
    issf_core_id = models.AutoField(primary_key=True)
    contribution_date = models.DateField(auto_now_add=True)
    contributor = models.ForeignKey(settings.AUTH_USER_MODEL,
            on_delete=models.CASCADE)
    edited_date = models.DateField(auto_now=True)
    editor = models.ForeignKey(settings.AUTH_USER_MODEL,
                               related_name='editor+', on_delete=models.CASCADE)
    core_record_type = models.TextField(default='Capacity Development')
    geographic_scope_type = models.CharField(max_length=100, default='Local')

    # model-specific fields
    CAPACITY_NEED_CATEGORY = (
        ('Economic', 'Economic'), ('Ecological', 'Ecological'),
        ('Social/Cultural', 'Social/Cultural'), ('Governance', 'Governance'),)
    capacity_need_category = models.CharField(max_length=50,
                                              choices=CAPACITY_NEED_CATEGORY)
    CAPACITY_NEED_TYPE = (('Existing', 'Existing'), ('Need', 'Need'),)
    capacity_need_type = models.CharField(max_length=50,
                                          choices=CAPACITY_NEED_TYPE)
    capacity_need_title = models.CharField(max_length=50)
    capacity_need_description = models.TextField()

    class Meta:
        managed = False
        db_table = 'ssf_capacity_need'

    def __str__(self):
        return '%s' % (self.capacity_need_title)

    def save(self, *args, **kwargs):
        self.capacity_need_title = conditional_escape(self.capacity_need_title)
        self.capacity_need_description = conditional_escape(self.capacity_need_description)
        super(SSFCapacityNeed, self).save(*args, **kwargs)


class SSFGuidelines(models.Model):
    # core (inherited from issf_core) fields
    issf_core_id = models.AutoField(primary_key=True)
    contribution_date = models.DateField(auto_now_add=True)
    contributor = models.ForeignKey(settings.AUTH_USER_MODEL,
            on_delete=models.CASCADE)
    edited_date = models.DateField(auto_now=True)
    editor = models.ForeignKey(settings.AUTH_USER_MODEL,
                               related_name='editor+', on_delete=models.CASCADE)
    core_record_type = models.TextField(default='SSF Guidelines')
    geographic_scope_type = models.CharField(max_length=100, default='Local')

    # model-specific fields
    title = models.CharField(max_length=256)
    ACTIVITY_TYPE = (
        ('Conference', 'Conference'), ('Journal Article', 'Journal Article'),
        ('Meeting', 'Meeting'), ('National Plan', 'National Plan'),
        ('Network', 'Network'), ('Newsletter', 'Newsletter'),
        ('Regional Programme', 'Regional Programme'), ('Workshop', 'Workshop'), ('Research', 'Research'))
    activity_type = models.CharField(choices=ACTIVITY_TYPE, max_length=100)
    ACTIVITY_COVERAGE = (('Regional', 'Regional'), ('National', 'National'),
                         ('International', 'International'),
                         ('Global', 'Global'))
    activity_coverage = models.CharField(choices=ACTIVITY_COVERAGE,
                                         max_length=100)
    location = models.CharField(max_length=256)
    start_day = models.SmallIntegerField(blank=True,
                                         validators=[MinValueValidator(1),
                                                     MaxValueValidator(31)])
    start_month = models.SmallIntegerField(blank=True,
                                           validators=[MinValueValidator(1),
                                                       MaxValueValidator(12)])
    start_year = models.SmallIntegerField(
        validators=[MinValueValidator(1000), MaxValueValidator(3000)])
    end_day = models.SmallIntegerField(blank=True,
                                       validators=[MinValueValidator(1),
                                                   MaxValueValidator(31)])
    end_month = models.SmallIntegerField(blank=True,
                                         validators=[MinValueValidator(1),
                                                     MaxValueValidator(12)])
    end_year = models.SmallIntegerField(blank=True,
                                        validators=[MinValueValidator(1000),
                                                    MaxValueValidator(3000)])
    ONGOING_STATUS = (('Yes', 'Yes'), ('No', 'No'))
    ongoing = models.CharField(choices=ONGOING_STATUS, max_length=100)
    organizer = models.CharField(max_length=256)
    purpose = models.TextField()
    link = models.URLField(blank=True)

    class Meta:
        managed = False
        db_table = 'ssf_guidelines'

    def __str__(self):
        return '%s' % self.title

    def save(self, *args, **kwargs):
        self.title = conditional_escape(self.title)
        self.location = conditional_escape(self.location)
        self.purpose = conditional_escape(self.purpose)
        self.organizer = conditional_escape(self.organizer)
        super(SSFGuidelines, self).save(*args, **kwargs)


class SSFExperiences(models.Model):
    # core (inherited from issf_core) fields
    issf_core_id = models.AutoField(primary_key=True)
    contribution_date = models.DateField(auto_now_add=True)
    contributor = models.ForeignKey(settings.AUTH_USER_MODEL,
            on_delete=models.CASCADE)
    edited_date = models.DateField(auto_now=True)
    editor = models.ForeignKey(settings.AUTH_USER_MODEL,
                               related_name='editor+',
                               on_delete=models.CASCADE)
    core_record_type = models.TextField(default='SSF Experiences')
    geographic_scope_type = models.CharField(max_length=100, default='Local')

    # model-specific fields
    title = models.CharField(max_length=256, blank=True)
    name = models.CharField(max_length=256, blank=False)
    video_url = models.URLField(blank=True)
    description = models.TextField(max_length=5000, blank=False)
    img_url = models.URLField(blank=True)
    vimeo_video_url = models.URLField(blank=True)

    class Meta:
        managed = False
        db_table = 'ssf_experience'

    def __str__(self):
        return '%s' % self.title

    def save(self, *args, **kwargs):
        self.title = conditional_escape(self.title)
        self.name = conditional_escape(self.name)
        self.description = conditional_escape(self.description)
        super(SSFExperiences, self).save(*args, **kwargs)


class SSFCaseStudies(models.Model):
    # core (inherited from issf_core) fields
    issf_core_id = models.AutoField(primary_key=True)
    contribution_date = models.DateField(auto_now_add=True)
    contributor = models.ForeignKey(settings.AUTH_USER_MODEL,
            on_delete=models.CASCADE)
    edited_date = models.DateField(auto_now=True)
    editor = models.ForeignKey(settings.AUTH_USER_MODEL,
                               related_name='editor+', on_delete=models.CASCADE)
    core_record_type = models.TextField(default='Case Study')
    geographic_scope_type = models.CharField(max_length=100, default='Local')

    # model-specific fields
    name = models.CharField(max_length=100, blank=False)
    role = models.CharField(max_length=100, blank=False)
    description_area = models.TextField(max_length=5000, blank=False)
    description_fishery = models.TextField(max_length=5000, blank=False)
    description_issues = models.TextField(max_length=5000, blank=False)
    issues_challenges = models.TextField(max_length=5000, blank=False)
    stakeholders = models.TextField(max_length=5000, blank=False)
    transdisciplinary = models.TextField(max_length=5000, blank=False)
    background_context = models.TextField(max_length=5000, blank=False)
    activities_innovation = models.TextField(max_length=5000, blank=False)

    class Meta:
        managed = False
        db_table = 'ssf_case_study'

    def __str__(self):
        return '%s' % self.name

    def save(self, *args, **kwargs):
        self.name = conditional_escape(self.name)
        self.role = conditional_escape(self.role)
        self.description_area = conditional_escape(self.description_area)
        self.description_fishery = conditional_escape(self.description_fishery)
        self.description_issues = conditional_escape(self.description_issues)
        self.issues_challenges = conditional_escape(self.issues_challenges)
        self.stakeholders = conditional_escape(self.stakeholders)
        self.transdisciplinary = conditional_escape(self.transdisciplinary)
        self.background_context = conditional_escape(self.background_context)
        self.activities_innovation = conditional_escape(self.activities_innovation)
        super(SSFCaseStudies, self).save(*args, **kwargs)


class CapacityNeedRating(models.Model):
    capacity_need_rating_id = models.AutoField(primary_key=True)
    capacity_need = models.ForeignKey(SSFCapacityNeed, on_delete=models.CASCADE)
    rater = models.ForeignKey(settings.AUTH_USER_MODEL,
            on_delete=models.CASCADE)
    STARS = [(i, i) for i in range(0, 6)]
    rating = models.IntegerField(choices=STARS, default=0)

    class Meta:
        managed = False
        db_table = 'capacity_need_rating'
        unique_together = ('capacity_need', 'rater',)

    def __str__(self):
        return '%s' % (self.rating)


class ISSFCore(models.Model):
    issf_core_id = models.AutoField(primary_key=True)
    contribution_date = models.DateField(auto_now_add=True)
    contributor = models.ForeignKey(settings.AUTH_USER_MODEL,
                                    related_name='contributor+',
                                    on_delete=models.CASCADE)
    edited_date = models.DateField(auto_now=True)
    editor = models.ForeignKey(settings.AUTH_USER_MODEL,
                               related_name='editor+', on_delete=models.CASCADE)
    core_record_type = models.CharField(max_length=100)
    core_record_summary = models.TextField(blank=True)
    core_record_status = models.IntegerField(blank=True, null=True)
    GEOGRAPHIC_SCOPE_TYPE = (
        ('Local', 'Local'), ('Sub-national', 'Sub-national'),
        ('National', 'National'), ('Regional', 'Regional'),
        ('Global', 'Global'), ('Not specific', 'Not specific'),)
    geographic_scope_type = models.CharField(choices=GEOGRAPHIC_SCOPE_TYPE,
                                             max_length=100, blank=False,
                                             null=False)

    class Meta:
        managed = False
        db_table = 'issf_core'


class ISSF_Core(models.Model):
    # class name exception (underscore) because ManyToManyField assumes pk
    # is lower(Table_Name) +
    # _id
    # in the database, all "core" tables (SSFKnowledge, SSFPerson,
    # SSFCaseStudy, etc.) inherit
    # from issf_core
    # this model is used for related data that applies to all core tables
    issf_core_id = models.AutoField(primary_key=True)
    contribution_date = models.DateField(auto_now_add=True)
    contributor = models.ForeignKey(settings.AUTH_USER_MODEL,
                                    related_name='contributor+',
                                    on_delete=models.CASCADE)
    edited_date = models.DateField(auto_now=True)
    editor = models.ForeignKey(settings.AUTH_USER_MODEL,
                               related_name='editor+', on_delete=models.CASCADE)
    core_record_type = models.CharField(max_length=100)
    core_record_summary = models.TextField(blank=True)
    core_record_status = models.IntegerField(blank=True, null=True)
    # geographic scope
    GEOGRAPHIC_SCOPE_TYPE = (
        ('Local', 'Local'), ('Sub-national', 'Sub-national'),
        ('National', 'National'), ('Regional', 'Regional'),
        ('Global', 'Global'), ('Not specific', 'Not specific'),)
    geographic_scope_type = models.CharField(choices=GEOGRAPHIC_SCOPE_TYPE,
                                             max_length=100, default='Local')
    countries = models.ManyToManyField(Country,
                                       db_table='geographic_scope_nation')

    class Meta:
        managed = False
        db_table = 'issf_core'


class ProfileOrganization(models.Model):
    profile_organization_id = models.AutoField(primary_key=True)
    ssfprofile = models.ForeignKey(SSFProfile, on_delete=models.CASCADE)
    ssforganization = models.ForeignKey(SSFOrganization, null=True, blank=True,
            on_delete=models.CASCADE)
    organization_name = models.CharField(max_length=200, blank=True)
    ORG_TYPE = (('State/government department', 'State/government department'),
                ('Union/association', 'Union/association'),
                ('Support organization', 'Support organization'), (
                    'Fisheries local action group',
                    'Fisheries local action group'),
                ('Market organization', 'Market organization'),
                ('Co-op/society', 'Co-op/society'), ('Other', 'Other'))
    organization_type = models.CharField(choices=ORG_TYPE, max_length=100,
                                         blank=True)
    GEOG_SCOPE = (('Local', 'Local'), ('Sub-national', 'Sub-national'),
                  ('National', 'National'), ('Regional', 'Regional'),
                  ('Global', 'Global'))
    geographic_scope = models.CharField(choices=GEOG_SCOPE, max_length=100,
                                        blank=True)

    class Meta:
        managed = False
        db_table = 'profile_organization'


class SelectedAttribute(models.Model):
    # only used for searching of qualitative/ordinal attributes, therefore
    # does not contains all
    # fields; see CommonAttributeView and MainAttributeView for adding records
    selected_attribute_id = models.AutoField(primary_key=True)
    attribute = models.ForeignKey(Attribute, limit_choices_to=Q(
        attribute_type='Qualitative') | Q(attribute_type='Ordinal'),
        on_delete=models.CASCADE)
    attribute_value = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'selected_attribute'


class SelectedThemeIssue(models.Model):
    # fields; see CommonThemeIssueView for adding records
    selected_theme_issue_id = models.AutoField(primary_key=True)
    theme_issue = models.ForeignKey(Theme_Issue, on_delete=models.CASCADE)
    theme_issue_value = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'selected_theme_issue'


class CommonAttributeView(models.Model):
    # uses database view to populate form of table of attributes
    # selected_attribute_id is the real PK, but could be multiple instances
    # due to multi-select of
    # qualitative values!
    # saving uses postgres INSTEAD OF rules to send updates to the
    # selected_attribute table
    row_number = models.IntegerField(verbose_name='', primary_key=True)
    selected_attribute_id = models.IntegerField(verbose_name='', blank=True,
                                                null=True)
    issf_core = models.ForeignKey(ISSF_Core, verbose_name='',
            on_delete=models.CASCADE)
    # attribute_id is a FK to Attribute
    attribute = models.ForeignKey(Attribute, limit_choices_to=Q(
        attribute_category='Common') | Q(attribute_category='Non-profile'),
        on_delete=models.CASCADE)
    attribute_value = models.ForeignKey(AttributeValue, blank=True, null=True,
            on_delete=models.CASCADE)
    other_value = models.CharField(max_length=100, blank=True)

    label_order = models.IntegerField(blank=True)
    value_order = models.IntegerField(blank=True)

    class Meta:
        managed = False
        db_table = 'common_attributes'
        ordering = ['label_order', 'value_order']


class CommonThemeIssueView(models.Model):
    # uses database view to populate form of table of attributes
    # selected_theme_issue_id is the real PK, but could be multiple
    # instances due to multi-select
    # of qualitative values!
    # saving uses postgres INSTEAD OF rules to send updates to the
    # selected_theme_issue table
    row_number = models.IntegerField(verbose_name='', primary_key=True)
    selected_theme_issue_id = models.IntegerField(verbose_name='', blank=True,
                                                  null=True)
    issf_core = models.ForeignKey(ISSF_Core, verbose_name='',
            on_delete=models.CASCADE)
    theme_issue = models.ForeignKey(Theme_Issue, on_delete=models.CASCADE)
    theme_issue_value = models.ForeignKey(Theme_Issue_Value, blank=True, null=True, on_delete=models.CASCADE)
    other_theme_issue = models.CharField(max_length=100, blank=True)

    category_order = models.IntegerField(blank=True)
    label_order = models.IntegerField(blank=True)

    class Meta:
        managed = False
        db_table = 'common_themes_issues'
        ordering = ['category_order', 'label_order']


class MainAttributeView(models.Model):
    # uses database view to populate form of table of attributes
    # selected_attribute_id is the real PK, but could be multiple instances
    # due to multi-select of
    # qualitative values!
    # saving uses postgres INSTEAD OF rules to send updates to the
    # selected_attribute table
    row_number = models.IntegerField(verbose_name='', primary_key=True)
    selected_attribute_id = models.IntegerField(verbose_name='', blank=True,
                                                null=True)
    issf_core = models.ForeignKey(ISSF_Core, verbose_name='', on_delete=models.CASCADE)
    attribute = models.ForeignKey(Attribute, limit_choices_to=Q(
        attribute_category='Main') | Q(attribute_category='Common'),
        on_delete=models.CASCADE)
    value = models.IntegerField(verbose_name='', blank=True, null=True)
    attribute_value = models.ForeignKey(AttributeValue, blank=True, null=True,
            on_delete=models.CASCADE)
    other_value = models.CharField(max_length=100, blank=True)
    additional = models.IntegerField(blank=True)
    additional_value = models.ForeignKey(AdditionalValue, blank=True, null=True, on_delete=models.CASCADE)
    label_order = models.IntegerField(blank=True)
    value_order = models.IntegerField(blank=True)

    class Meta:
        managed = False
        db_table = 'main_attributes'
        ordering = ['label_order', 'value_order']


class ISSFCoreMapPointUnique(models.Model):
    # issf_core_map_point_unique is a database view, not a table; it is
    # read-only
    row_number = models.IntegerField(primary_key=True)
    issf_core_id = models.IntegerField()
    contribution_date = models.DateField(auto_now_add=True)
    contributor = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='contributor+', on_delete=models.CASCADE)
    edited_date = models.DateTimeField(auto_now=True)
    editor = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='editor+', on_delete=models.CASCADE)
    core_record_type = models.TextField(blank=True)
    core_record_summary = models.TextField(blank=True)
    core_record_status = models.IntegerField(blank=True, null=True)
    geographic_scope_type = models.TextField(blank=True)
    map_point = models.PointField()
    lon = models.FloatField()
    lat = models.FloatField()
    # Manager is required for geographic queries on this or related models
    objects = models.Manager()

    class Meta:
        managed = False
        db_table = 'issf_core_map_point_unique'


class RecentContributions(models.Model):
    # recent_contributions is a database view, not a table; it is read-only
    issf_core_id = models.IntegerField(primary_key=True)
    core_record_type = models.TextField()
    core_record_summary = models.TextField()

    class Meta:
        managed = False
        db_table = 'recent_contributions'


class ContributionsByRecordType(models.Model):
    # contributions_by_record_type is a database view, not a table; it is
    # read-only
    row_number = models.IntegerField(primary_key=True)
    core_record_type = models.TextField()
    contribution_count = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'contributions_by_record_type'


class ContributionsByGeographicScope(models.Model):
    # contributions_by_geographic_scope_type is a database view,
    # not a table; it is read-only
    geographic_scope_type = models.TextField()
    scope_order = models.IntegerField(primary_key=True)
    contribution_count = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'contributions_by_geographic_scope_type'


class ContributionsByCountry(models.Model):
    # contributions_by_geographic_scope_country is a database view,
    # not a table; it is read-only
    short_name = models.TextField(primary_key=True)
    contribution_count = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'contributions_by_country'


# models attached to issf_core via foreign key
class SelectedThemeIssue(models.Model):
    selected_theme_issue_id = models.AutoField(primary_key=True)
    issf_core = models.ForeignKey(ISSF_Core, db_column='issf_core_id',
            on_delete=models.CASCADE)
    theme_issue_value = models.ForeignKey(Theme_Issue_Value, db_column='theme_issue_value_id', on_delete=models.CASCADE)
    other_theme_issue = models.TextField()

    class Meta:
        managed = False
        db_table = 'selected_theme_issue'


class ExternalLink(models.Model):
    external_link_id = models.AutoField(primary_key=True)
    LINK_TYPE = (('URL Link', 'URL Link'), ('Image Link', 'Image Link'),
                 ('YouTube Video Link', 'YouTube Video Link'),)
    link_type = models.CharField(choices=LINK_TYPE, max_length=50)
    link_address = models.URLField(max_length=2000)
    issf_core = models.ForeignKey(ISSF_Core, on_delete=models.CASCADE)

    class Meta:
        managed = False
        db_table = 'external_link'

    def __str__(self):
        return '%s %s' % (self.link_type, self.link_address)


class Species(models.Model):
    species_id = models.AutoField(primary_key=True)
    issf_core = models.ForeignKey(ISSF_Core, on_delete=models.CASCADE)
    species_scientific = models.CharField(max_length=100, blank=True)
    species_common = models.CharField(max_length=100, blank=True)
    landings = models.IntegerField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'species'

    def __str__(self):
        return '%s(%s)' % (self.species_common, self.species_scientific)


class Region(models.Model):
    region_id = models.AutoField(primary_key=True)
    region_name = models.CharField(max_length=100)

    # region_point
    # region_polygon

    class Meta:
        managed = False
        db_table = 'region'
        ordering = ['region_name']

    def __str__(self):
        return '%s' % (self.region_name)


class GeographicScopeLocalArea(models.Model):
    geographic_scope_local_area_id = models.AutoField(primary_key=True)
    issf_core = models.ForeignKey(ISSF_Core, on_delete=models.CASCADE)
    local_area_name = models.CharField(max_length=100)
    local_area_alternate_name = models.CharField(max_length=100, blank=True)
    country = models.ForeignKey(Country, on_delete=models.CASCADE)
    LOCAL_AREA_SETTING = (
        ('Urban', 'Urban'), ('Rural, developed', 'Rural, developed'),
        ('Rural, less developed', 'Rural, less developed'),
        ('Unspecified', 'Unspecified'), ('Other', 'Other'),)
    local_area_setting = models.CharField(choices=LOCAL_AREA_SETTING,
                                          max_length=100)
    local_area_setting_other = models.CharField(max_length=100, blank=True)
    local_area_point = models.PointField(blank=True, null=True)
    objects = models.Manager()

    class Meta:
        managed = False
        db_table = 'geographic_scope_local_area'

    def __str__(self):
        return '%s' % (self.local_area_name)


class GeographicScopeSubnation(models.Model):
    geographic_scope_subnation_id = models.AutoField(primary_key=True)
    issf_core = models.ForeignKey(ISSF_Core, on_delete=models.CASCADE)
    subnation_name = models.CharField(max_length=100)
    country = models.ForeignKey(Country, on_delete=models.CASCADE)
    SUBNATION_TYPE = (
        ('Canton', 'Canton'), ('Commune', 'Commune'), ('County', 'County'),
        ('Department', 'Department'), ('District', 'District'),
        ('Province', 'Province'), ('State', 'State'),
        ('Territory', 'Territory'), ('Unspecified', 'Unspecified'),
        ('Other', 'Other'),)
    subnation_type = models.CharField(choices=SUBNATION_TYPE, max_length=100)
    subnation_type_other = models.CharField(max_length=100, blank=True)
    subnation_point = models.PointField(blank=True, null=True)
    objects = models.Manager()

    class Meta:
        managed = False
        db_table = 'geographic_scope_subnation'

    def __str__(self):
        return '%s' % (self.subnation_name)


class GeographicScopeNation(models.Model):
    geographic_scope_nation_id = models.AutoField(primary_key=True)
    issf_core = models.ForeignKey(ISSF_Core, on_delete=models.CASCADE)
    country = models.ForeignKey(Country, on_delete=models.CASCADE)

    class Meta:
        managed = False
        db_table = 'geographic_scope_nation'

    def __str__(self):
        return '%s' % (self.country.short_name)


class Geographic_Scope_Region(models.Model):
    # class name exception (underscore) because ManyToManyField assumes pk
    # is lower(Table_Name) +
    # _id
    geographic_scope_region_id = models.AutoField(primary_key=True)
    issf_core = models.ForeignKey(ISSF_Core, on_delete=models.CASCADE)
    region = models.ForeignKey(Region, on_delete=models.CASCADE)
    region_name_other = models.CharField(max_length=100, blank=True)
    countries = models.ManyToManyField(Country,
                                       db_table='geographic_scope_region_country',
                                       blank=True)

    class Meta:
        managed = False
        db_table = 'geographic_scope_region'

    def __str__(self):
        return '%s' % (self.country.region_name)


class SiteVersion(models.Model):
    site_version_id = models.AutoField(primary_key=True)
    major_version = models.TextField()
    minor_version = models.TextField()
    revision = models.TextField()
    release_date = models.DateField()

    class Meta:
        managed = False
        db_table = 'site_version'
        ordering = ['-major_version', '-minor_version', '-revision']


class Change(models.Model):
    change_id = models.AutoField(primary_key=True)
    site_version = models.ForeignKey(SiteVersion, on_delete=models.CASCADE)
    change_desc = models.TextField()

    class Meta:
        managed = False
        db_table = 'change'


class FAQCategory(models.Model):
    faq_category_id = models.AutoField(primary_key=True)
    faq_category = models.CharField(max_length=255)

    def __str__(self):
        return self.faq_category

    class Meta:
        managed = False
        db_table = 'faq_category'


class FAQ(models.Model):
    faq_id = models.AutoField(primary_key=True)
    question = models.CharField(max_length=255)
    answer = models.CharField(max_length=1000)
    faq_category = models.ForeignKey(FAQCategory, on_delete=models.CASCADE)

    class Meta:
        managed = False
        db_table = 'faq'


class DidYouKnow(models.Model):
    id = models.AutoField(primary_key=True)
    fact = models.TextField(blank=False)

    class Meta:
        managed = False
        db_table = 'did_you_know'


class WhoFeature(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.TextField(blank=False)
    about = models.TextField(blank=True, null=True, default='')
    img_url = models.URLField(blank=True, null=True)
    ssf_person = models.ForeignKey(SSFPerson, blank=True, null=True,
            on_delete=models.CASCADE)
    ssf_knowledge = models.ForeignKey(SSFKnowledge, blank=True, null=True,
            on_delete=models.CASCADE)

    class Meta:
        managed = False
        db_table = 'who_feature'
