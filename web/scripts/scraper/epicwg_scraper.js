"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var firecrawl_1 = require("firecrawl");
var client_1 = require("@prisma/client");
var dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
var prisma = new client_1.PrismaClient();
var app = new firecrawl_1.default({
    apiKey: 'fc-bbe5576ee3944e15bd7dafb234eb129b'
});
function scrapeEpicWG() {
    return __awaiter(this, void 0, void 0, function () {
        var mainPageResponse, data, _i, _a, room, existingRoom, _b, _c, area, existingArea, existingLocation, error_1;
        var _d, _e, _f, _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    console.log('Starte Scraping von epicwg.odoo.com...');
                    _h.label = 1;
                case 1:
                    _h.trys.push([1, 22, , 23]);
                    // Hauptseite scrapen
                    console.log('Scrape Hauptseite...');
                    return [4 /*yield*/, app.scrape_url('https://epicwg.odoo.com/das-haus', {
                            formats: ['markdown', 'extract', 'screenshot'],
                            extract: {
                                prompt: "Extrahiere folgende Informationen von der WG-Website auf Deutsch:\n          - Zimmer: Titel, Beschreibung, Gr\u00F6\u00DFe (in m\u00B2), Ausstattung und Bilder\n          - Gemeinschaftsbereiche: Titel, Beschreibung, Features, Bilder, Typ (z.B. K\u00FCche, Werkstatt) und Stockwerk\n          - Standort: Beschreibung, Highlights, Bilder, Adresse\n          Formatiere die Ausgabe als strukturierte JSON-Daten.",
                                systemPrompt: "Du bist ein Assistent, der Informationen über Wohngemeinschaften extrahiert. Achte besonders auf Details zu Zimmern, Gemeinschaftsbereichen und dem Standort."
                            }
                        })];
                case 2:
                    mainPageResponse = _h.sent();
                    if (!mainPageResponse.extract) {
                        throw new Error('Keine Daten von der Hauptseite erhalten');
                    }
                    data = mainPageResponse.extract;
                    // Daten in die Datenbank importieren
                    console.log('Importiere Zimmer...');
                    _i = 0, _a = data.rooms;
                    _h.label = 3;
                case 3:
                    if (!(_i < _a.length)) return [3 /*break*/, 9];
                    room = _a[_i];
                    return [4 /*yield*/, prisma.room.findFirst({
                            where: { title: room.title }
                        })];
                case 4:
                    existingRoom = _h.sent();
                    if (!existingRoom) return [3 /*break*/, 6];
                    return [4 /*yield*/, prisma.room.update({
                            where: { id: existingRoom.id },
                            data: {
                                description: room.description,
                                size: room.size,
                                price: room.price || calculatePrice(room.size),
                                amenities: room.amenities,
                                images: room.images,
                                available: true
                            }
                        })];
                case 5:
                    _h.sent();
                    return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, prisma.room.create({
                        data: {
                            title: room.title,
                            description: room.description,
                            size: room.size,
                            price: room.price || calculatePrice(room.size),
                            amenities: room.amenities,
                            images: room.images,
                            available: true
                        }
                    })];
                case 7:
                    _h.sent();
                    _h.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 3];
                case 9:
                    console.log('Importiere Gemeinschaftsbereiche...');
                    _b = 0, _c = data.commonAreas;
                    _h.label = 10;
                case 10:
                    if (!(_b < _c.length)) return [3 /*break*/, 16];
                    area = _c[_b];
                    return [4 /*yield*/, prisma.commonArea.findFirst({
                            where: { title: area.title }
                        })];
                case 11:
                    existingArea = _h.sent();
                    if (!existingArea) return [3 /*break*/, 13];
                    return [4 /*yield*/, prisma.commonArea.update({
                            where: { id: existingArea.id },
                            data: {
                                description: area.description,
                                features: area.features,
                                images: area.images,
                                type: area.type,
                                floor: area.floor || 0,
                                size: area.size
                            }
                        })];
                case 12:
                    _h.sent();
                    return [3 /*break*/, 15];
                case 13: return [4 /*yield*/, prisma.commonArea.create({
                        data: {
                            title: area.title,
                            description: area.description,
                            features: area.features,
                            images: area.images,
                            type: area.type,
                            floor: area.floor || 0,
                            size: area.size
                        }
                    })];
                case 14:
                    _h.sent();
                    _h.label = 15;
                case 15:
                    _b++;
                    return [3 /*break*/, 10];
                case 16:
                    console.log('Importiere Standortinformationen...');
                    if (!data.location) return [3 /*break*/, 21];
                    return [4 /*yield*/, prisma.location.findFirst()];
                case 17:
                    existingLocation = _h.sent();
                    if (!existingLocation) return [3 /*break*/, 19];
                    return [4 /*yield*/, prisma.location.update({
                            where: { id: existingLocation.id },
                            data: {
                                description: data.location.description,
                                highlights: data.location.highlights,
                                images: data.location.images,
                                address: data.location.address,
                                latitude: (_d = data.location.coordinates) === null || _d === void 0 ? void 0 : _d.latitude,
                                longitude: (_e = data.location.coordinates) === null || _e === void 0 ? void 0 : _e.longitude
                            }
                        })];
                case 18:
                    _h.sent();
                    return [3 /*break*/, 21];
                case 19: return [4 /*yield*/, prisma.location.create({
                        data: {
                            description: data.location.description,
                            highlights: data.location.highlights,
                            images: data.location.images,
                            address: data.location.address,
                            latitude: (_f = data.location.coordinates) === null || _f === void 0 ? void 0 : _f.latitude,
                            longitude: (_g = data.location.coordinates) === null || _g === void 0 ? void 0 : _g.longitude
                        }
                    })];
                case 20:
                    _h.sent();
                    _h.label = 21;
                case 21: return [2 /*return*/, data];
                case 22:
                    error_1 = _h.sent();
                    console.error('Fehler beim Scrapen:', error_1);
                    throw error_1;
                case 23: return [2 /*return*/];
            }
        });
    });
}
function calculatePrice(size) {
    var basePrice = 400;
    var pricePerSqm = 10;
    return Math.round(basePrice + (size * pricePerSqm));
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 5]);
                    console.log('Starte den EpicWG Scraper...');
                    return [4 /*yield*/, scrapeEpicWG()];
                case 1:
                    data = _a.sent();
                    console.log('Scraping erfolgreich abgeschlossen!');
                    console.log("".concat(data.rooms.length, " Zimmer importiert"));
                    console.log("".concat(data.commonAreas.length, " Gemeinschaftsbereiche importiert"));
                    console.log('Standortinformationen aktualisiert');
                    return [3 /*break*/, 5];
                case 2:
                    error_2 = _a.sent();
                    console.error('Fehler beim Ausführen des Scrapers:', error_2);
                    process.exit(1);
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, prisma.$disconnect()];
                case 4:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
if (require.main === module) {
    main();
}
