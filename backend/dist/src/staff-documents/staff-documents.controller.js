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
exports.StaffDocumentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const staff_documents_service_1 = require("./staff-documents.service");
let StaffDocumentsController = class StaffDocumentsController {
    constructor(service) {
        this.service = service;
    }
    upload(staffId, file, name, type) {
        if (!file)
            throw new Error('File is required');
        return this.service.upload(staffId, file, name || file.originalname, type || 'other');
    }
    findByStaff(staffId) {
        return this.service.findByStaff(staffId);
    }
    remove(id) {
        return this.service.remove(id);
    }
};
exports.StaffDocumentsController = StaffDocumentsController;
__decorate([
    (0, common_1.Post)(':staffId'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Param)('staffId')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('name')),
    __param(3, (0, common_1.Body)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", void 0)
], StaffDocumentsController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)(':staffId'),
    __param(0, (0, common_1.Param)('staffId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StaffDocumentsController.prototype, "findByStaff", null);
__decorate([
    (0, common_1.Delete)('doc/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StaffDocumentsController.prototype, "remove", null);
exports.StaffDocumentsController = StaffDocumentsController = __decorate([
    (0, common_1.Controller)('documents/staff'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('Admin', 'Officer'),
    __metadata("design:paramtypes", [staff_documents_service_1.StaffDocumentsService])
], StaffDocumentsController);
//# sourceMappingURL=staff-documents.controller.js.map