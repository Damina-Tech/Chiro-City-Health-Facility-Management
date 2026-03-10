"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const facilities_module_1 = require("./facilities/facilities.module");
const staff_module_1 = require("./staff/staff.module");
const facility_documents_module_1 = require("./facility-documents/facility-documents.module");
const staff_documents_module_1 = require("./staff-documents/staff-documents.module");
const notifications_module_1 = require("./notifications/notifications.module");
const audit_module_1 = require("./audit/audit.module");
const dashboard_controller_1 = require("./dashboard/dashboard.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            platform_express_1.MulterModule.register({
                storage: (0, multer_1.memoryStorage)(),
                limits: { fileSize: 10 * 1024 * 1024 },
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            audit_module_1.AuditModule,
            facilities_module_1.FacilitiesModule,
            staff_module_1.StaffModule,
            facility_documents_module_1.FacilityDocumentsModule,
            staff_documents_module_1.StaffDocumentsModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [dashboard_controller_1.DashboardController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map