# grw-resources
#### Get Ghost Recon Wildlands resources on a single button press (actually two with some waiting and luck)

![https://wanztwurst.github.io/grw-resources/GRW-Resources.html](https://wanztwurst.github.io/grw-resources/res/comstools.png)


## What it does

Connects to your running GRW game on PC, sends your desired amount of resources, that's it.

* Select amount
* ???
* Profit


## How it works

The game opens a web server when started. This way it communicates with the GRW HQ Android application - from which you can natively send resources to your main game. Exactly this is reproduced by this web app, but without the mini game bullshit, waiting time between the resource transfers or quantitiy limits.
And because the game uses the handy WebSockets protocol, which your browser speaks as well, it can all be done from a webpage.

More details and instructions on the page itself.


## Issues

There is a nasty error I can't get rid of. It has something to do with websocket messages from the game containing something else beneath UTF-8 content. Because of that error I have to reload the whole page to give it a second, third, sometimes even more tries.
So reloading is totally done intentional after each error, after some tries it always worked for me. Reloading stops automatically when the connection is usable.

If you experience reloading over more than, lets say, 30 seconds - there is probably something wrong with either
a) your game not running and logged in
b) wrong ip address (if not locally)
c) windows firewall is still up
d) not enough internet points (aka reddit karma)
