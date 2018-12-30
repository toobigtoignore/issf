def get_redirectname(core_record_type):
    urls = {
        "State-of-the-Art in SSF Research": 'sota-details',
        "Who's Who in SSF": 'who-details',
        "SSF Organization": 'organization-details',
        "Capacity Development": 'capacity-details',
        "SSF Profile": 'profile-details',
        "SSF Guidelines": 'guidelines-details',
        "Case Study": 'case-studies-details',
        "SSF Experiences": 'experiences-details'
    }
    return urls[core_record_type]
