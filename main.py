import obspython as obs
import urllib.request
from xml import etree
import xmltodict, json

# --------------------DATA------------------------------------------

URL = "https://superliga.com.pl/matches_new.php?id="
HOME_PLAYER_SOURCE = "NazwaGospGracz"
GUEST_PLAYER_SOURCE = "NazwaGoscGracz"
HOME_SCORE_SOURCE = "WynikGosp"
GUEST_SCORE_SOURCE = "WynikGosc"

team_home_score = 0
team_guest_score = 0
home_player_name = ""
guest_player_name = ""

idMatch = 1515 
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
    obs.obs_properties_get(props, "idMatch")
    return props

def script_load(settings):
    """
    Called on script load. This is called when the script is loaded and
    initialized.
    """
    obs.timer_add(update, 1000)

def script_update(settings):
    """
    Called when the script’s settings (if any) have been changed by the user.
    """
    set_idMatch(settings)
    


# --------------------Functions--------------------------------------

def update():
    global URL, idMatch, is_running, team_home_score, team_guest_score, home_player_name, guest_player_name, contentDict
    if is_running:
        url_match = URL+str(idMatch)
        print("Updating score... (IdMatch: ", idMatch, ")")
        data = load_data(url_match)
        set_team_score(data)
        set_players_name(data)
        print("Score updated.", team_home_score, ":", team_guest_score)
    
def update_text_gui(source, text):
    source = obs.obs_get_source_by_name(source)
    if source is not None:
        settings = obs.obs_data_create()
        obs.obs_data_set_string(settings, "text", text)
        obs.obs_source_update(source, settings)
        obs.obs_data_release(settings)
        obs.obs_source_release(source)



def load_data(url):
    global contentDict
    responseXML = urllib.request.urlopen(url).read()
    contentDict = xmltodict.parse(responseXML)
    print("Data loaded...")
    return contentDict

def set_players_name(data):
    game_id = int(team_guest_score) + int(team_home_score) + 1 
    home_player_name = data['tenis_stolowy']['mecz'+str(game_id)]['nazwisko_gosp']
    update_text_gui(HOME_PLAYER_SOURCE, home_player_name)
    guest_player_name = data['tenis_stolowy']['mecz'+str(game_id)]['nazwisko_gosc']
    update_text_gui(GUEST_PLAYER_SOURCE, guest_player_name)

def set_team_score(data):
    global team_guest_score, team_home_score
    team_home_score = data['tenis_stolowy']['wynik']['duze_punkty_gosp']
    update_text_gui(HOME_SCORE_SOURCE, team_home_score)
    team_guest_score = data['tenis_stolowy']['wynik']['duze_punkty_gosc']
    update_text_gui(GUEST_SCORE_SOURCE, team_guest_score)


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
