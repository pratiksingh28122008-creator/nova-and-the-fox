# Nova And The Fox

BUILD A COMPLETE 2D PIXEL-ART SURVIVAL ADVENTURE GAME

Game Title: LOST IN THE COSMOS — A JOURNEY HOME

Build a complete, playable, browser-based 2D pixel-art adventure and survival game about a stranded astronaut trying to return to his home planet.



This must be an interactive game with real gameplay mechanics, not merely a landing page, a dashboard, a visual prototype, or a sequence of static screens.



Use a retro pixel-art visual style inspired by classic 2D indie survival and exploration games. Create a beautiful atmospheric universe with animated stars, pixel-art spaceships, meteor showers, alien vegetation, futuristic alien technology, particle effects, character sprites, sound effects, and cinematic transitions.



The game must contain exactly FIVE MAIN LEVELS. Each level should have its own setting, objectives, mini-games, meaningful choices, and consequences.



The game should be playable using mouse clicks, touchscreen controls, and keyboard controls. Make it responsive for desktop, tablet, and mobile devices.



1. STORY AND CHARACTERS

The protagonist is an astronaut named NOVA, who is returning from a deep-space research mission when a cosmic storm damages his spacecraft.



His ship loses navigation, communication, and propulsion systems. Nova becomes stranded far away from his home planet, AURELIA.



He has limited food, water, oxygen, battery power, repair materials, and fuel.



Nova's only companion is PIP, a small, adorable robotic space fox that assists him with scanning, collecting resources, detecting danger, and solving puzzles.



Pip has independent health, battery energy, happiness, and trust levels. The player must care for Pip throughout the adventure.



One day, Nova receives a mysterious radio transmission from an unknown planet. The signal could lead to help, but following it could be dangerous.



As the adventure progresses, Nova discovers an advanced alien civilization that might possess the technology required to rebuild his ship and guide him home.



Create an emotional narrative about survival, friendship, discovery, difficult decisions, and finding a way home.



Include cinematic storytelling between levels, expressive character animations, dialogue boxes, environmental storytelling, and a satisfying ending.



2. CORE GAMEPLAY AND SURVIVAL SYSTEMS

Display a compact survival HUD throughout all five levels.



Player status:



Health: 100 HP.

Water: 100 units.

Food: 100 units.

Oxygen: 100 units.

Suit battery: 100%.

Ship integrity: 100%.

Collected resources.

Current objective.

Pip's health, battery, happiness, and trust.

Use attractive pixel-art icons and animated horizontal status bars.



All survival values must be real state variables. They must change in response to gameplay, decisions, hazards, and resource consumption.



Implement these mechanics:



Water decreases during active gameplay and strenuous activities.

Food decreases gradually as time passes and when the player performs demanding tasks.

Oxygen decreases during spacewalks and dangerous exploration.

Suit battery powers tools, scanners, and repairs.

Damage reduces health.

Pip's battery and health must also be maintained.

Allow players to collect water, food, minerals, batteries, and repair components.

Include an inventory system with limited carrying capacity.

Add a crafting system for useful survival items.

Allow the player to feed, repair, recharge, and interact affectionately with Pip.

Give Pip useful abilities that improve with trust.

Provide a pause menu, sound controls, settings, objective tracker, and save/load functionality.

Avoid unfair instant deaths. Warn players before dangerous decisions and offer ways to recover through exploration, crafting, or resource management.



If health reaches zero, show a game-over screen with a restart option and a checkpoint-based continue option.



If resources are critically low, show warnings and opportunities to replenish them.



Choices must have consequences that persist across all five levels.



3. LEVEL ONE — ALONE IN THE VOID

Environment: Nova's damaged spacecraft floating in deep space.



Begin with a cinematic animation showing the spacecraft tumbling through space, flickering lights, a damaged control panel, Nova waking up, and Pip activating beside him.



Display the opening dialogue:



NOVA: "Hello? Control, do you read me?"



RADIO: "Signal unavailable."



NOVA: "Navigation is gone. Fuel is nearly depleted. I have no idea where I am."



PIP: "Beep... survival protocol activated!"



The player must stabilize the ship and establish a sustainable survival routine.



Create an explorable spacecraft interior with clickable rooms and animated objects:



Cockpit.

Hydroponic laboratory.

Engineering room.

Communication station.

Storage room.

Observation window.

The player must complete at least FOUR meaningful activities before advancing.



Activity A: Build a miniature hydroponic farm

Let the player choose between:



Fast-growing algae: produces food quickly but consumes more electricity.

Hydroponic vegetables: provides nutritious food but takes longer to grow.

Emergency mushroom cultivation: grows in darkness but consumes water.

Create an interactive farming mini-game where the player plants seeds, regulates water, adjusts lighting, and monitors growth.



Plants should visibly grow over time through multiple pixel-art animation stages.



Different choices must produce different benefits and drawbacks.



Activity B: Inspect and repair the ship's energy system

Create an interactive electrical puzzle involving wires, switches, circuit nodes, and power-routing tiles.



The player must restore power to essential systems.



Choices:



Repair the solar collectors: reliable long-term energy.

Activate the emergency reactor: immediate power with overheating risk.

Disable nonessential systems: conserves power but reduces comfort and farming efficiency.

Allow the player to connect circuits manually using mouse or touch input.



Successful repairs animate the lights turning back on and the ship systems restarting.



Failed attempts consume a small amount of time or battery, but can be retried.



Activity C: Contact the home planet

Create a communication mini-game requiring the player to tune radio frequency, adjust signal strength, and align a directional antenna.



Possible outcomes:



A strong signal reveals fragments of a home-planet transmission.

A partial signal provides a navigation coordinate but consumes additional energy.

A poor signal reveals an unidentified alien transmission.

Make the mysterious transmission important to Level Two.



Activity D: Search for emergency supplies

Allow the player to search storage containers and repair lockers.



Use a simple memory puzzle or item-matching mini-game to unlock the emergency supply cabinet.



Possible rewards include food packets, water cartridges, repair materials, and a rare energy cell.



Some containers may be empty or contain damaged supplies.



Activity E: Take care of Pip

Let the player recharge Pip, provide food supplements, repair a loose component, or play a short reaction mini-game.



High trust should improve Pip's assistance in later levels.



Level One ending

After completing the activities, Nova receives a strange repeating signal from an unknown planet.



Display a cinematic scene with a blinking coordinate on the navigation screen.



NOVA: "That signal isn't from Aurelia... but it might be my only chance."



PIP: "Unknown destination detected. Survival probability uncertain."



Unlock Level Two.



Persist all resources, farm choices, energy status, signal quality, inventory, and Pip's trust.



4. LEVEL TWO — THE METEOR GAUNTLET

Environment: Deep space, with a mysterious planet visible in the distance.



Start with a navigation sequence in which the player follows radio pulses toward the unknown planet.



Create a signal-following mini-game. The player must identify the direction of the strongest radio signal and select the correct navigation path.



Wrong turns consume fuel or time but should not immediately end the game.



After the navigation puzzle, trigger a meteor shower.



Spacecraft flight gameplay

Create a playable 2D arcade section where the spacecraft moves horizontally across the screen while meteors travel toward it.



Use pixel-art explosions, engine trails, screen shake, flashing warning indicators, and escalating background music.



Implement four large on-screen controls:



LEFT: move the spacecraft left.

RIGHT: move the spacecraft right.

SHOOT: fire defensive energy pulses or activate a defensive tool.

BACK: pause the flight and open a return-to-checkpoint confirmation screen.

The BACK button must not instantly undo the level or erase progress.



Keyboard support:



Arrow keys or A/D to move.

Spacebar to shoot.

Escape to pause.

Support touch controls with responsive pointer handling and continuous movement while a control is held.



Meteor phase one: Warning field

Duration: approximately 20–30 seconds.



Slow meteors.

Low meteor density.

Large gaps between obstacles.

Introduce basic movement and shooting.

Show a short tutorial before the action starts.

Meteor phase two: Fragment field

Duration: approximately 30–40 seconds.



Increase meteor speed.

Add small, fast meteors and large, slow meteors.

Small meteors move unpredictably.

Large meteors occupy more space and require wider evasive movements.

Shooting can break smaller meteors and weaken certain large meteors.

Add collectible energy fragments for skilled players.

Meteor phase three: The storm core

Duration: approximately 40–50 seconds.



High meteor density.

Rapid changes in meteor direction.

Mixed meteor sizes.

Narrow safe passages.

More intense music and visual effects.

A final short survival sequence that tests the skills learned in previous phases.

Increase difficulty gradually and fairly. Do not spawn unavoidable meteors directly on the spacecraft.



Success and failure

Track collisions, survival time, damage, and collected fragments.



If the player survives all three phases, show:



"METEOR FIELD CLEARED!"



Play an animation showing Nova's ship escaping the storm.



However, one final large meteor strikes the ship's wing during the escape cinematic, regardless of whether the player completed the section perfectly. Skilled players should still receive less damage and better rewards.



Show sparks, a broken wing panel, alarms, and smoke escaping from the damaged spacecraft.



NOVA: "We made it... Pip, please tell me that wasn't the important wing."



PIP: "Structural integrity compromised. Repair recommended immediately."



Unlock Level Three.



If the player fails the flight challenge, display "SIGNAL LOST — TRY AGAIN" and allow them to replay the current meteor phase or restart the sequence from a checkpoint. Preserve their long-term resources while applying reasonable retry costs.



5. LEVEL THREE — THE SPACEWALK ENGINEER

Environment: Outside the spacecraft, surrounded by stars and the distant planet.



This level must be a substantial hands-on repair mission, designed to last at least FOUR MINUTES during normal play.



Target approximately 5–7 minutes for a thorough first-time playthrough.



Do not achieve this duration through empty waiting, forced timers, or repetitive dialogue. Require meaningful actions, puzzle-solving, and interactive assembly.



Opening cinematic

Nova looks at the broken wing through the cockpit window.



NOVA: "The stabilizer is gone. If I don't repair it, we'll never survive atmospheric entry."



PIP: "External repair protocol available. Warning: oxygen reserves limited."



Nova puts on his spacesuit, checks the oxygen supply, opens the airlock, and floats toward the damaged wing.



Repair stage A: Diagnose the damage

Allow the player to scan the wing using a repair scanner.



Create a visual damage map showing:



Broken stabilizer.

Loose wiring.

Cracked outer panel.

Damaged power connector.

Missing fastening bolts.

Players can select each damaged area to inspect it.



Different scan settings reveal different amounts of information and consume different amounts of battery.



Pip can assist if trust is high enough.



Repair stage B: Choose a repair strategy

Offer three approaches:



Salvage a compatible part from the cargo bay: cheaper but requires an extra retrieval task.

Fabricate a replacement using collected minerals: consumes resources but can create a stronger wing.

Apply an emergency patch: faster but reduces the ship's maximum durability.

Every option must have distinct advantages and disadvantages that affect the next levels.



Repair stage C: Retrieve missing components

Create a zero-gravity collection mini-game.



The player must navigate floating debris, grab the correct components, avoid sharp wreckage, and return to the repair area.



Use directional controls, an interact button, a tether mechanic, and limited oxygen.



Missing the tether anchor should cause a recoverable setback rather than an unavoidable death.



Pip can retrieve small parts or illuminate dark corners.



Repair stage D: Rebuild the wing

Create a drag-and-drop assembly puzzle.



Display a pixel-art blueprint and a workbench interface with:



Wing frame.

Stabilizer plate.

Power connector.

Wiring.

Fastening bolts.

Thermal shield.

Repair sealant.

The player must place components in the correct slots and follow a step-by-step holographic guide.



Required actions:



Align the frame.

Insert the stabilizer plate.

Connect the electrical wiring.

Secure the bolts in the correct order.

Install the thermal shield.

Apply sealant.

Run a diagnostic calibration.

Wrong placements should produce useful hints. Incorrect wiring can drain battery or require a small rework task.



Allow the player to rotate components, inspect clues, zoom into the blueprint, and request a hint from Pip.



Repair stage E: Calibrate the wing

Create a timing and rhythm mini-game in which the player adjusts three calibration sliders to match the blueprint's target ranges.



Then run a diagnostic test with animated mechanical movement, a simulated wind test, and a power-routing challenge.



The quality of the final repair depends on the player's performance:



Perfect repair: maximum ship integrity and improved flight handling.

Good repair: normal ship performance.

Emergency repair: lower durability and increased fuel consumption.

Do not make perfect performance mandatory for story progression.



Repair stage F: Survive an unexpected hazard

A solar flare begins while Nova is outside the ship.



The player must quickly choose a safe action:



Return to the airlock.

Anchor to the spacecraft and shield behind the wing.

Ask Pip to activate a temporary protective field if enough energy is available.

Each choice has a different outcome affecting oxygen, health, battery, or repair quality.



Repair stage G: Return and celebrate

Nova returns to the cockpit.



Play an animation showing the wing locking into place, the engine restarting, and the ship's navigation display stabilizing.



PIP: "Wing repair complete. Survival probability improved!"



NOVA: "Good work, little buddy. Let's find out who sent that signal."



Unlock Level Four.



Ensure the repair level includes real-time progress, several interactive puzzles, recoverable failures, and resource-management decisions that naturally support at least four minutes of gameplay.



6. LEVEL FOUR — THE PLANET OF LIVING LIGHT

Environment: A mysterious alien planet covered with enormous glowing plants, luminous rivers, bioluminescent mushrooms, unusual trees, ancient ruins, floating spores, and distant mountains.



Arrival cinematic

Show the repaired spacecraft approaching the planet.



Display a cinematic view through the cockpit window. The planet gradually grows larger, revealing clouds, oceans, glowing vegetation, and strange structures.



Play an atmospheric soundtrack.



NOVA: "I've never seen anything like this."



PIP: "Unknown biosphere detected. Recommend cautious exploration."



As Nova enters the planet's gravitational field, the damaged spacecraft experiences turbulence.



Trigger a dramatic crash-landing sequence:



Warning lights flash.

The ship shakes.

Instruments fail.

The spacecraft descends through alien clouds.

The ship lands in an overgrown clearing.

Dust and glowing spores fill the screen.

Nova survives, but the ship cannot launch again until major repairs are completed.



The player must explore the area and locate a safe cave that will become the base for Level Five.



Make the alien world explorable

Create a side-scrolling 2D pixel-art environment with:



Several connected exploration areas.

Alien plants with different reactions to touch.

Hidden resource caches.

Small alien creatures.

Environmental puzzles.

Climbable roots and platforms.

Toxic spores and safe zones.

Collectible glowing seeds.

Ancient structures with alien symbols.

The player can walk, jump, interact, scan, and use Pip's abilities.



Make exploration rewarding without requiring the player to collect everything.



Main objective: Find a safe cave

Create a branching exploration mission with FOUR primary routes.



Route A: The glowing forest.



Nova follows luminous plants that react to his suit's light.



Choices:



Follow the brightest plants.

Scan the plant patterns with Pip.

Harvest glowing fruit for food.

Different choices may reveal a safe path, provide supplies, trigger a defensive plant reaction, or reveal a hidden trail.



Route B: The crystal river.



Nova discovers a river containing glowing crystals and unfamiliar aquatic life.



Choices:



Collect water and test it.

Cross a narrow crystal bridge.

Follow the river downstream.

Use a scanner to identify a safe crossing.

Outcomes may provide water, crafting materials, information about local wildlife, or a minor recoverable hazard.



Route C: The ancient ruins.



Nova discovers a damaged alien monument with symbols matching the mysterious radio signal.



Choices:



Decode the symbols.

Restore power to a small alien terminal.

Search the ruins for supplies.

Ask Pip to scan the structure.

Successful puzzles reveal fragments of an ancient map leading toward the cave and provide clues about the alien civilization.



Route D: The dangerous spore valley.



Nova encounters oversized alien plants releasing glowing spores.



Choices:



Sneak past the plants.

Distract them using a light source.

Wear the suit's filtered mask.

Take a longer route around the valley.

Outcomes should affect oxygen, health, time, and collected supplies. Clever players should be able to avoid damage.



Interactive exploration questionnaire

Include 5–7 short, story-integrated questions distributed throughout the exploration.



These are interactive decisions and knowledge checks, not a separate exam.



Example questions:



A glowing plant closes when you approach. What should you do?

A. Touch it repeatedly. B. Observe its light pattern with the scanner. C. Cut it down. Best outcome: B reveals a safe path.



Your water detector finds liquid in the crystal river. What is the safest first step?

A. Drink it immediately. B. Test a sample with the suit's analyzer. C. Ignore all water. Best outcome: B identifies whether treatment is needed.



You find three symbols on an ancient door. How should you proceed?

A. Guess randomly. B. Compare the symbols with the radio signal pattern. C. Force the door open. Best outcome: B reveals the code.



Pip detects movement behind a group of alien flowers. What do you do?

A. Scan from a safe distance. B. Run into the flowers. C. Waste a battery charge shooting randomly. Best outcome: A identifies the creature.



Your oxygen drops while exploring a toxic valley. What should you prioritize?

A. Collect every resource. B. Reach a safe area and restore your supplies. C. Continue without checking the meter. Best outcome: B protects both Nova and Pip.



A damaged alien beacon points toward a cave. What should you do?

A. Repair or power the beacon. B. Destroy it. C. Ignore every clue. Best outcome: A reveals the shortest safe route.



You find two possible caves. One has strange noises, while the other has a stable energy reading. What is the best first step

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://nova-and-the-fox.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/456bfee8-8ca4-46ef-9a99-74cafad64805).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
