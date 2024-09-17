import obspython as obs
import urllib.request
from xml import etree
import xmltodict, json

# --------------------DATA------------------------------------------

idMatch = 1515 # <-------- ID OF THE MATCH!
url = "https://superliga.com.pl/matches_new.php?id="+str(idMatch)
contentDict = {}
is_running = False

# --------------------Script Functions------------------------------


def script_properties():
    """
    Called to define user properties associated with the script. These
    properties are used to define how to show settings properties to a user.
    """
    props = obs.obs_properties_create()
    obs.obs_properties_add_button(props, "buttonStart", "Start", start_live_score)
    obs.obs_properties_add_button(props, "buttonStop", "Stop", stop_live_score)
    obs.obs_properties_add_int(props, "idMatch", "ID Match", 0, 100000, 1)

    return props

def script_load(settings):
    """
    Called on script load. This is called when the script is loaded and
    initialized.
    """
    load_data()
    obs.timer_add(update_score, 1000)

def script_update(settings):
    """
    Called when the script’s settings (if any) have been changed by the user.
    """
    set_idMatch(settings)
    


# --------------------Functions--------------------------------------

def update_score():
    global url
    if is_running:
        print("Updating score... (IdMatch: ", idMatch, ")")
        load_data()


def load_data():
    global contentDict
    global url
    responseXML = urllib.request.urlopen(url).read()
    contentDict = xmltodict.parse(responseXML)

def set_idMatch(settings):
    global idMatch
    if is_running==False:
        idMatch = obs.obs_data_get_int(settings, "idMatch")
        print("Setting ID Match: ", idMatch)
    else:
        print("Cannot change ID Match while live score is running.")


def start_live_score(props, prop):
    global is_running
    is_running = True
    print("Starting live score...")
    
    


def stop_live_score(props, prop):
    global is_running
    is_running = False
    print("Stopping live score...")
