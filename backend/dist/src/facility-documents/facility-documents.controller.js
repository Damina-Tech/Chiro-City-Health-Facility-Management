"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacilityDocumentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const facility_documents_service_1 = require("./facility-documents.service");
let FacilityDocumentsController = class FacilityDocumentsController {
    constructor(service) {
        this.service = service;
    }
    upload(facilityId, file, name, type) {
        if (!file)
            throw new Error('File is required');
        return this.service.upload(facilityId, file, name || file.originalname, type || 'other');
    }
    findByFacility(facilityId) {
        return this.service.findByFacility(facilityId);
    }
    remove(id) {
        return this.service.remove(id);
    }
};
exports.FacilityDocumentsController = FacilityDocumentsController;
__decorate([
    (0, common_1.Post)(':facilityId'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Param)('facilityId')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('name')),
    __param(3, (0, common_1.Body)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", void 0)
], FacilityDocumentsController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)(':facilityId'),
    __param(0, (0, common_1.Param)('facilityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FacilityDocumentsController.prototype, "findByFacility", null);
__decorate([
    (0, common_1.Delete)('doc/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FacilityDocumentsController.prototype, "remove", null);
exports.FacilityDocumentsController = FacilityDocumentsController = __decorate([
    (0, common_1.Controller)('documents/facility'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('Admin', 'Officer'),
    __metadata("design:paramtypes", [facility_documents_service_1.FacilityDocumentsService])
], FacilityDocumentsController);
//# sourceMappingURL=facility-documents.controller.js.map