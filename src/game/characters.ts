/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CharacterDef, CharacterId } from './types';

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  mustapha: {
    id: 'mustapha',
    name: 'Mustapha Cairo',
    title: 'The Flying Kick Expert',
    bio: 'Engineer and Jack\'s best friend. Unrivaled speed and agile aerial kicks make him the arcade favorite.',
    speed: 4.2,
    maxHp: 95,
    power: 4,
    agility: 5,
    reach: 5,
    specialCost: 8,
    specialName: 'Tornado Windmill Kick',
    portraitColor: '#EAB308',
    shirtColor: '#36723A', // Olive green safari shirt
    pantsColor: '#DEB43E', // Mustard yellow combat pants
    accentColor: '#653A1C', // Saddle brown boots & belt
    skinColor: '#BD7D48', // Warm tanned bronze skin
    hairColor: '#140E0C', // Black hair & mustache
  },
  jack: {
    id: 'jack',
    name: 'Jack Tenrec',
    title: 'Hot-blooded Mechanic',
    bio: 'Passionate Cadillac restorer and shaman of the machine. Great balance of power, range, and slide kicks.',
    speed: 3.7,
    maxHp: 100,
    power: 4,
    agility: 4,
    reach: 4,
    specialCost: 8,
    specialName: 'Spinning Uppercut Slice',
    portraitColor: '#22C55E',
    shirtColor: '#15803D', // Olive green shirt
    pantsColor: '#FACC15', // Light yellow pants
    accentColor: '#A16207', // Cap & boots
    skinColor: '#FBBF24',
    hairColor: '#18181B',
  },
  hannah: {
    id: 'hannah',
    name: 'Hannah Dundee',
    title: 'Diplomat & Explorer',
    bio: 'Nimble scientist and lethal knife fighter. Exceptional acrobatics, fast combos, and aerial control.',
    speed: 4.4,
    maxHp: 85,
    power: 3,
    agility: 5,
    reach: 4,
    specialCost: 7,
    specialName: 'Spiral Somersault Blossom',
    portraitColor: '#F97316',
    shirtColor: '#EA580C', // Orange crop top
    pantsColor: '#F8FAFC', // White pants
    accentColor: '#7C3AED', // Dark purple long hair
    skinColor: '#FED7AA',
    hairColor: '#4C1D95',
  },
  mess: {
    id: 'mess',
    name: "Mess O'Bradovich",
    title: 'The Gentle Mountain',
    bio: 'Massive gentle giant whose sheer brute strength crushes poachers and stops charging dinosaurs in their tracks.',
    speed: 3.0,
    maxHp: 130,
    power: 5,
    agility: 2,
    reach: 3,
    specialCost: 10,
    specialName: 'Seismic Shockwave Smash',
    portraitColor: '#EF4444',
    shirtColor: '#D97706', // Brown/orange sleeveless vest
    pantsColor: '#0D9488', // Teal combat pants
    accentColor: '#78350F', // Heavy boots & gauntlets
    skinColor: '#FDE047',
    hairColor: '#18181B', // Dark flattop
  },
};
