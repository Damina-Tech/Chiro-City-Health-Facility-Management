"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacilityDocumentsModule = void 0;
const common_1 = require("@nestjs/common");
const facility_documents_service_1 = require("./facility-documents.service");
const facility_documents_controller_1 = require("./facility-documents.controller");
let FacilityDocumentsModule = class FacilityDocumentsModule {
};
exports.FacilityDocumentsModule = FacilityDocumentsModule;
exports.FacilityDocumentsModule = FacilityDocumentsModule = __decorate([
    (0, common_1.Module)({
        controllers: [facility_documents_controller_1.FacilityDocumentsController],
        providers: [facility_documents_service_1.FacilityDocumentsService],
        exports: [facility_documents_service_1.FacilityDocumentsService],
    })
], FacilityDocumentsModule);
//# sourceMappingURL=facility-documents.module.js.map