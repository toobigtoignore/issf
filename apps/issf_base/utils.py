def get_redirectname(core_record_type: str) -> str:
    """
    Converts a record type to the url name to be used for reverse.

    :param core_record_type: The record type
    :return: The name of the url for this record to be used with reverse
    """
    urls = {
        "State-of-the-Art in SSF Research": 'sota-details',
        "Who's Who in SSF": 'who-details',
        "SSF Organization": 'organization-details',
        "Capacity Development": 'capacity-details',
        "SSF Profile": 'profile-details',
        "SSF Guidelines": 'guidelines-details',
        "Case Study": 'case-studies-details',
        "SSF Experiences": 'experiences-details',
        "SSF Blue Justice": 'bluejustice-details'
    }
    return urls[core_record_type]
