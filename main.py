import obspython as obs
import urllib.request
from xml import etree
import xmltodict, json

# --------------------DATA------------------------------------------

idMatch = 1515 # <-------- ID OF THE MATCH!
url = "https://superliga.com.pl/matches_new.php?id="+str(idMatch)
contentJson = {}

# --------------------Script Functions------------------------------


def script_properties():
    """
    Called to define user properties associated with the script. These
    properties are used to define how to show settings properties to a user.
    """
    props = obs.obs_properties_create()
    return props

def script_load(settings):
    """
    Called on script load. This is called when the script is loaded and
    initialized.
    """
    global contentJson
    global url
    
    responseXML = urllib.request.urlopen(url).read()
    contentJson = xmltodict.parse(responseXML)
    json.dumps(contentJson) # '{"e": {"a": ["text", "text"]}}'
    print(contentJson)
    
    obs.timer_add(update_score, 1000)


# --------------------Functions--------------------------------------

def update_score():
    global url



# ------------------------------------------------------------



    # source = obs.obs_get_source_by_name("Timer")
    # text = str(counter)
    # if source is not None:
    #     settings = obs.obs_data_create()
    #     obs.obs_data_set_string(settings, "text", text)
    #     obs.obs_source_update(source, settings)
    #     obs.obs_data_release(settings)
    #     obs.obs_source_release(source)