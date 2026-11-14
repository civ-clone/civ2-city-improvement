"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.improvements = void 0;
const CityImprovements_1 = require("../CityImprovements");
const Advances_1 = require("@civ-clone/civ2-science/Advances");
// RULES.TXT @IMPROVE rows 1 to 34, read by OpenCiv2 `src/auto/civ.cpp` `rules_load_improvements`
//  (richardpenman/civ2@49f26ec; its baked copy is `src/game/rules.cpp` `rules_improvements`). Numbers only: cost in rows
//  of shields (× @COSMIC's shield box rows), upkeep in gold a turn, and the advance needed (`null`: none).
exports.improvements = [
    // @IMPROVE row 1.
    [CityImprovements_1.Palace, 10, 0, Advances_1.Masonry],
    // @IMPROVE row 2.
    [CityImprovements_1.Barracks, 4, 1, null],
    // @IMPROVE row 3.
    [CityImprovements_1.Granary, 6, 1, Advances_1.Pottery],
    // @IMPROVE row 4.
    [CityImprovements_1.Temple, 4, 1, Advances_1.CeremonialBurial],
    // @IMPROVE row 5.
    [CityImprovements_1.Marketplace, 8, 1, Advances_1.Currency],
    // @IMPROVE row 6.
    [CityImprovements_1.Library, 8, 1, Advances_1.Writing],
    // @IMPROVE row 7.
    [CityImprovements_1.Courthouse, 8, 1, Advances_1.CodeOfLaws],
    // @IMPROVE row 8.
    [CityImprovements_1.CityWalls, 8, 0, Advances_1.Masonry],
    // @IMPROVE row 9.
    [CityImprovements_1.Aqueduct, 8, 2, Advances_1.Construction],
    // @IMPROVE row 10.
    [CityImprovements_1.Bank, 12, 3, Advances_1.Banking],
    // @IMPROVE row 11.
    [CityImprovements_1.Cathedral, 12, 3, Advances_1.Monotheism],
    // @IMPROVE row 12.
    [CityImprovements_1.University, 16, 3, Advances_1.University],
    // @IMPROVE row 13.
    [CityImprovements_1.MassTransit, 16, 4, Advances_1.MassProduction],
    // @IMPROVE row 14.
    [CityImprovements_1.Colosseum, 10, 4, Advances_1.Construction],
    // @IMPROVE row 15.
    [CityImprovements_1.Factory, 20, 4, Advances_1.Industrialization],
    // @IMPROVE row 16.
    [CityImprovements_1.ManufacturingPlant, 32, 6, Advances_1.Robotics],
    // @IMPROVE row 17.
    [CityImprovements_1.SdiDefence, 20, 4, Advances_1.Laser],
    // @IMPROVE row 18.
    [CityImprovements_1.RecyclingCenter, 20, 2, Advances_1.Recycling],
    // @IMPROVE row 19.
    [CityImprovements_1.PowerPlant, 16, 4, Advances_1.Refining],
    // @IMPROVE row 20.
    [CityImprovements_1.HydroPlant, 24, 4, Advances_1.Electronics],
    // @IMPROVE row 21.
    [CityImprovements_1.NuclearPlant, 16, 2, Advances_1.NuclearPower],
    // @IMPROVE row 22.
    [CityImprovements_1.StockExchange, 16, 4, Advances_1.Economics],
    // @IMPROVE row 23.
    [CityImprovements_1.SewerSystem, 12, 2, Advances_1.Sanitation],
    // @IMPROVE row 24.
    [CityImprovements_1.Supermarket, 8, 3, Advances_1.Refrigeration],
    // @IMPROVE row 25.
    [CityImprovements_1.Superhighways, 20, 5, Advances_1.Automobile],
    // @IMPROVE row 26.
    [CityImprovements_1.ResearchLab, 16, 3, Advances_1.Computers],
    // @IMPROVE row 27.
    [CityImprovements_1.SamMissileBattery, 10, 2, Advances_1.Rocketry],
    // @IMPROVE row 28.
    [CityImprovements_1.CoastalFortress, 8, 1, Advances_1.Metallurgy],
    // @IMPROVE row 29.
    [CityImprovements_1.SolarPlant, 32, 4, Advances_1.Environmentalism],
    // @IMPROVE row 30.
    [CityImprovements_1.Harbour, 6, 1, Advances_1.Seafaring],
    // @IMPROVE row 31.
    [CityImprovements_1.OffshorePlatform, 16, 3, Advances_1.Miniaturization],
    // @IMPROVE row 32.
    [CityImprovements_1.Airport, 16, 3, Advances_1.Radio],
    // @IMPROVE row 33.
    [CityImprovements_1.PoliceStation, 6, 2, Advances_1.Communism],
    // @IMPROVE row 34.
    [CityImprovements_1.PortFacility, 8, 3, Advances_1.AmphibiousWarfare],
];
exports.default = exports.improvements;
//# sourceMappingURL=improvements.js.map