def escape():
    s = """Bloons TD 6	com.ninjakiwi.bloonstd6
Fruit Ninja 2 Fun Action Games	com.halfbrick.fruitninjax
Sky Force Reloaded	pl.idreams.SkyForceReloaded2016
Bricks and Balls-Brick Crusher	com.teestudio.bricksnballs.breakerquest
WindWings: Space Shooter	com.Wind.wings.Space.Shooter
Archer Hunter - Adventure Game	co.imba.archero
Claw Stars	com.appxplore.clawstars
Mahjong Club - Solitaire Game	com.gamovation.mahjongclub
Rummikub®	com.rummikubfree
Backgammon - Lord of the Board	air.com.beachbumgammon
Flutter: Butterfly Sanctuary	com.runawayplay.flutter
Chess Online	chessfriends.online.chess
Naga Fishing World	game.naga.fishing.world
Bricks and Balls-Brick Crusher	com.teestudio.bricksnballs.breakerquest
Schnapsen - 66 Online Cardgame	com.ste.android.schnopsnfree
Spades Royale	com.bbumgames.spadesroyale
PokerGaga: Texas Holdem Live	com.zcmxd.pokergaga
Space Decor : Mansion	com.zymobile.space.apartment
Journey Decor	com.zymobile.journey.decor
Space Decor : Island	com.zymobile.dream.island
Jewel Party: Match 3 PVP	com.kingone.puzzle.gemking
Matching Story	com.joycastle.mergematch
Space Decor : Luxury Yacht	com.zymobile.dream.houseboat
Merge Matters: House Design	puzzle.merge.family.mansion
Blockudoku®: block puzzle game	com.easybrain.block.puzzle.games
Medieval Merge: Epic Adventure	com.pixodust.games.free.rpg.medieval.merge.puzzle.empire
クラッシュフィーバー パズルRPG 新感覚ブッ壊しバトル！	jp.wonderplanet.CrashFever
Figure Fantasy	com.komoe.fsgp
Cafeland - Restaurant Cooking	com.gamegos.mobile.cafeland
Dream Hospital: Care Simulator	com.yboga.dreamhospital
スタンドマイヒーローズ	com.colyinc.standMyHeroes
Kung fu Supreme	com.mujoy.wysdx.tw
Darts Club: PvP Multiplayer	com.boombitgames.Dartsy
The Grand Mafia	com.yottagames.gameofmafia
Smashing Four: PvP Hero bump	com.geewa.smashingfour
Merge Duck 2: Idle RPG	com.onemoregame.leagueofxenoduck
Heroic - Magic Duel	com.nordeus.heroic
Merge Tactics: Kingdom Defense	com.loadcomplete.mergedefense
Days Bygone - Castle Defense	com.frivolition.daysbygone
Hero Adventure: Dark RPG	com.pgstudio.heroadventure
Wizard Legend: Fighting Master	com.loongcheer.neverlate.wizardlegend.fightmaster
Virtual Families: Cook Off	com.ldw.cooking
Bankrupt Demon King	com.EOAG.BankruptDevil
June's Journey: Hidden Objects	net.wooga.junes_journey_hidden_object_mystery_game"""
    return s.replace("\n", "\\n").replace("\t", "\\t")

if __name__ == "__main__":
    print(escape())