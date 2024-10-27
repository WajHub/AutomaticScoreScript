import obspython as obs
import urllib.request
from xml import etree
import xmltodict, json

class Team:
    def __init__(self, score, name, sets, points):
        self._score = score
        self._name = name
        self._sets = sets
        self._points = points

    @property
    def score(self):
        return self._score

    @score.setter
    def score(self, score):
        self._score = score

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, name):
        self._name = name

    @property
    def sets(self):
        return self._sets

    @sets.setter
    def sets(self, sets):
        self._sets = sets

    @property
    def points(self):
        return self._points

    @points.setter
    def points(self, points):
        self._points = points

# --------------------DATA------------------------------------------

URL = "https://superliga.com.pl/matches_new.php?id="

HOME_PLAYER_SOURCE = "NazwaGospGracz"
GUEST_PLAYER_SOURCE = "NazwaGoscGracz"
HOME_SCORE_SOURCE = "WynikGosp"
GUEST_SCORE_SOURCE = "WynikGosc"
HOME_SETS_SOURCE = "SetyGosp"
GUEST_SETS_SOURCE = "SetyGosc"
HOME_POINTS_SOURCE = "PunktyGosp"
GUEST_POINTS_SOURCE = "PunktyGosc"

TIMER_TICK = 3000
TICKS_DISPLAY_NEW_SET = 5
TICKS_DISPLAY_NEW_SINGLE_GAME = 12

idMatch = 0 
is_running = False

home_team = Team(score = 0, name = "Home", sets = 0, points = 0)
guest_team = Team(score = 0, name = "Guest", sets = 0, points = 0)

prev_id_single_game = 1
is_new_single_game = False
counter_display_new_single_game = 0

counter_display_new_set = 0

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
    global TIMER_TICK
    obs.timer_add(update, TIMER_TICK)

def script_update(settings):
    """
    Called when the script’s settings (if any) have been changed by the user.
    """
    set_idMatch(settings)

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

# --------------------Functions--------------------------------------

def update():
    global is_running
    if is_running:
        data = load_data()
        if "error" in data['tenis_stolowy']:
            print("Error: ", data['tenis_stolowy']['error'])
        else: 
            set_up(data)

def load_data():
    url_match = URL+str(idMatch)
    print("Updating score... (IdMatch: ", idMatch, ")")
    responseXML = urllib.request.urlopen(url_match).read()
    contentDict = xmltodict.parse(responseXML)
    print("Data loaded...")
    return contentDict

def set_up(data):
    global prev_id_single_game, counter_display_new_single_game
    if is_new_single_game(data):
        add_last_point_in_single_game()
        counter_display_new_single_game += 1
        if (counter_display_new_single_game >= TICKS_DISPLAY_NEW_SINGLE_GAME):
            prev_id_single_game += 1
        print(f"Displaying score finished single game... ({counter_display_new_single_game}/{TICKS_DISPLAY_NEW_SINGLE_GAME})")
    else: 
        set_points(data)
        set_sets(data)
        set_team_score(data)
        set_players_name(data)
        print_info()
        counter_display_new_single_game = 0 
    print("-------------------------------------------------")

def set_points(data):
    global home_team, guest_team, counter_display_new_set
    home_team.points = data['tenis_stolowy']['wynik']['male_punkty_gosp']
    guest_team.points = data['tenis_stolowy']['wynik']['male_punkty_gosc']
    if is_new_set(home_team.points, guest_team.points):
        if counter_display_new_set >= TICKS_DISPLAY_NEW_SET:
            update_text_gui(HOME_POINTS_SOURCE, "0")
            update_text_gui(GUEST_POINTS_SOURCE,"0")
            set_sets(data)
        else:
            counter_display_new_set += 1
            update_text_gui(HOME_POINTS_SOURCE, home_team.points)
            update_text_gui(GUEST_POINTS_SOURCE, guest_team.points)
            print(f"Displaying finished set... ({counter_display_new_set}/{TICKS_DISPLAY_NEW_SET})")
    else:
        counter_display_new_set = 0
        update_text_gui(HOME_POINTS_SOURCE, home_team.points)
        update_text_gui(GUEST_POINTS_SOURCE, guest_team.points)

def set_sets(data):
    global home_team, guest_team, counter_display_new_set
    home_team.sets = data['tenis_stolowy']['wynik']['sety_punkty_gosp']
    guest_team.sets = data['tenis_stolowy']['wynik']['sety_punkty_gosc']
    if is_new_set(home_team.points, guest_team.points):
        if counter_display_new_set >= TICKS_DISPLAY_NEW_SET:
            update_text_gui(HOME_SETS_SOURCE, home_team.sets)
            update_text_gui(GUEST_SETS_SOURCE, guest_team.sets)
    else:
        update_text_gui(HOME_SETS_SOURCE, home_team.sets)
        update_text_gui(GUEST_SETS_SOURCE, guest_team.sets)

def set_team_score(data):
    global home_team, guest_team
    home_team.score = data['tenis_stolowy']['wynik']['duze_punkty_gosp']
    guest_team.score = data['tenis_stolowy']['wynik']['duze_punkty_gosc']
    update_text_gui(HOME_SCORE_SOURCE, home_team.score)
    update_text_gui(GUEST_SCORE_SOURCE, guest_team.score)

def set_players_name(data):
    global home_team, guest_team, prev_id_single_game, is_new_single_game
    game_id = int(home_team.score) + int(guest_team.score) + 1 
    home_team.name = data['tenis_stolowy']['mecz'+str(game_id)]['nazwisko_gosp']
    guest_team.name = data['tenis_stolowy']['mecz'+str(game_id)]['nazwisko_gosc']
    update_text_gui(HOME_PLAYER_SOURCE, home_team.name)
    update_text_gui(GUEST_PLAYER_SOURCE, guest_team.name)

def print_info():
    global home_team, guest_team, prev_id_single_game, counter_display_new_set
    print("Score updated.", home_team.score, ":", guest_team.score)
    print("Players: ", home_team.name, " - ", guest_team.name)
    print("Sets: ", home_team.sets, " - ", guest_team.sets)
    print("Points: ", home_team.points, " - ", guest_team.points)
    print("Id prev single game: ", prev_id_single_game)

def is_new_match(home_sets, guest_sets):
    if int(home_sets) > 2 or int(guest_sets) > 2:
        return True
    return False

def is_new_set(home_points, guest_points):
    if int(home_points) - int(guest_points) > 1 or int(guest_points) - int(home_points) > 1:
        if int(home_points) > 10 or int(guest_points) > 10:
            return True
    return False

def is_new_single_game(data):
    global prev_id_single_game, home_team, guest_team
    game_id = int(data['tenis_stolowy']['wynik']['duze_punkty_gosp']) + int(data['tenis_stolowy']['wynik']['duze_punkty_gosc']) + 1
    if prev_id_single_game != game_id:
        return True
    return False

def add_last_point_in_single_game():
    global home_team, guest_team
    if int(home_team.points) > int(guest_team.points):
        point = int(home_team.points) + 1
        home_team.points = str(point)
        update_text_gui(HOME_POINTS_SOURCE, home_team.points)
        point -= 1
        home_team.points = str(point)
    else:
        point = int(guest_team.points) + 1
        guest_team.points = str(point)
        update_text_gui(GUEST_POINTS_SOURCE, guest_team.points)
        point -= 1
        guest_team.points = str(point)

def update_text_gui(source, text):
    source = obs.obs_get_source_by_name(source)
    if source is not None:
        settings = obs.obs_data_create()
        obs.obs_data_set_string(settings, "text", text)
        obs.obs_source_update(source, settings)
        obs.obs_data_release(settings)
        obs.obs_source_release(source)
