/*:
-------------------------------------------------------------------------
@title Custom Party Leader
@author Hime --> HimeWorks (http://himeworks.com)
@date Nov 27, 2015
@filename HIME_CustomPartyLeader.js
@url http://himeworks.com/2015/11/custom-party-leader

If you enjoy my work, consider supporting me on Patreon!

* https://www.patreon.com/himeworks

If you have any questions or concerns, you can contact me at any of
the following sites:

* Main Website: http://himeworks.com
* Facebook: https://www.facebook.com/himeworkscom/
* Twitter: https://twitter.com/HimeWorks
* Youtube: https://www.youtube.com/c/HimeWorks
* Tumblr: http://himeworks.tumblr.com/

-------------------------------------------------------------------------------
@plugindesc Allows you to assign a specific actor as party leader. Instead of
being the first person in the party. Can assign enemy troop leaders as well
@help 
-------------------------------------------------------------------------------
== Description ==

Video: https://www.youtube.com/watch?v=uxYdoPP3Wd0

In RPG Maker, you have something called "actors" which are the characters that
the player controls.

All actors are grouped into a "unit" called a "party". Actors can be added or
removed from parties at anytime during the game. You can potentially have
multiple parties in your game, depending on how your project is set up.

Each party has a leader. The leader is the actor that will be displayed while
you're traveling on the map. By default, the leader is the actor that is in
the first position of the party. So for example if you switched the positions
of the first and second members of the party, the leader will change.

Similar to actors, enemies are also grouped into their own unit called a
"troop". Enemy troops by default do not have a leader.

Now, what happens if you wanted the party leader to be someone other than
the first person in the party? Maybe you want the leader to be a specific
actor, but that actor doesn't participate in battle.

Or perhaps you wanted enemy troops to have a leader, and make it so that
when the leader dies, the enemies will scatter and run away?

With this plugin, you can set up who will be the leaders of parties
and troops, and build additional plugins on top of it that allow you to
use these leaders to implement new game mechanics.

== Terms of Use ==

- Free for use in non-commercial projects with credits
- Contact me for commercial use

== Change Log ==

Nov 27, 2015 - fix crash error during battle test
Nov 26, 2015 - initial release

== Usage ==

-- Default Leaders --

When your party is first set up, it assumes the leader is the actor in the
first position of the party.

Similarly, when the enemy troop is set up, the first enemy will be selected
as the leader.

It is intended that you will change the leaders through events during the
game.

-- Checking Who is the Leader --

You can ask who is the leader in script calls like this:

  $gameParty.leader()
  $gameTroop.leader()
  
It is possible that a unit does not have a leader. It will return `null`
in that case.

-- Changing Party Leaders --

You can change leaders during the game. To change the party leader, use the
following plugin command

  change_party_leader to actor ID
  
Where ID is the Id of the actor you wish to set as the leader. For example,
if you wanted to choose actor 4 to be the leader, you can write

  change_party_leader to actor 4

The actor does not need to be in the party.

-- Changing Enemy Troop leaders

Similarly, you can change enemy troop leaders as well. Use the following
plugin command

  change_troop_leader to enemy MEMBER_ID
  
Where the MEMBER_ID is the position of a particular enemy in the current
troop. This is based on the order that they were added into the troop.

For example, to set the third enemy as the leader, you would write

  change_troop_leader to enemy 3

-- Working with Custom Units --

If you have other units aside from parties and troops, you would need to
use script calls to set the leaders. 

  UNIT_OBJECT.setLeader(battlerObject)
  
All units must inherit from Game_Unit, and the leader must inherit from
Game_BattlerBase.

-------------------------------------------------------------------------------
 */ 
var Imported = Imported || {} ;
var TH = TH || {};
Imported.CustomPartyLeader = 1;
TH.CustomPartyLeader = TH.CustomPartyLeader || {};

(function ($) {

  var TH_GameUnit_initialize = Game_Unit.prototype.initialize;
  Game_Unit.prototype.initialize = function() {
    TH_GameUnit_initialize.call(this);
    this._leader = null;
  };
  
  Game_Unit.prototype.leader = function() {
    return this._leader;
  };
  
  Game_Unit.prototype.setLeader = function(battler) {
    this._leader = battler;
  };
  
  Game_Unit.prototype.initLeader = function() {
    this.setLeader(this.members()[0]);
  };
  
  /***************************************************************************/
  
  var TH_GameParty_initialize = Game_Party.prototype.initialize;
  Game_Party.prototype.initialize = function() {
    TH_GameParty_initialize.call(this);
  };

  Game_Party.prototype.leader = function() {
    return Game_Unit.prototype.leader.call(this);
  };
  
  var TH_GameParty_setupStartingMembers = Game_Party.prototype.setupStartingMembers;
  Game_Party.prototype.setupStartingMembers = function() {
    TH_GameParty_setupStartingMembers.call(this);
    this.initLeader();
  };
  
  var TH_GameParty_setupBattleTestMembers = Game_Party.prototype.setupBattleTestMembers;
  Game_Party.prototype.setupBattleTestMembers = function() {
    TH_GameParty_setupBattleTestMembers.call(this);
    this.initLeader();
  };
  
  /***************************************************************************/
  
  var TH_GameTroop_setup = Game_Troop.prototype.setup;
  Game_Troop.prototype.setup = function(troopId) {
    TH_GameTroop_setup.call(this, troopId);
    this.initLeader();
  };
  
  /***************************************************************************/
  
  var TH_GameInterpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    var cmd = command.toLowerCase();
    if (cmd === "change_party_leader") {
      var id = Math.floor(args[2]);
      $gameParty.setLeader($gameActors.actor(id));
      $gamePlayer.refresh();
    }
    else if (cmd === "change_troop_leader") {
      var index = Math.floor(args[2]) - 1
      $gameTroop.setLeader($gameTroop.members()[index]);
    }
    else {
      TH_GameInterpreter_pluginCommand.call(this, command, args);
    }
  };
})(TH.CustomPartyLeader);