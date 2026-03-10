"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    const adminRole = await prisma.role.upsert({
        where: { name: 'Admin' },
        update: {},
        create: {
            name: 'Admin',
            description: 'Full system control',
        },
    });
    const officerRole = await prisma.role.upsert({
        where: { name: 'Officer' },
        update: {},
        create: {
            name: 'Officer',
            description: 'Add/update facilities and staff',
        },
    });
    const permissions = await Promise.all([
        prisma.permission.upsert({
            where: { name: 'facilities.*' },
            update: {},
            create: { name: 'facilities.*', description: 'All facility operations' },
        }),
        prisma.permission.upsert({
            where: { name: 'staff.*' },
            update: {},
            create: { name: 'staff.*', description: 'All staff operations' },
        }),
        prisma.permission.upsert({
            where: { name: 'documents.*' },
            update: {},
            create: { name: 'documents.*', description: 'Document upload/manage' },
        }),
        prisma.permission.upsert({
            where: { name: 'notifications.*' },
            update: {},
            create: { name: 'notifications.*', description: 'View notifications' },
        }),
        prisma.permission.upsert({
            where: { name: 'dashboard.view' },
            update: {},
            create: { name: 'dashboard.view', description: 'View dashboard' },
        }),
    ]);
    await prisma.role.update({
        where: { id: adminRole.id },
        data: { permissions: { connect: permissions.map((p) => ({ id: p.id })) } },
    });
    await prisma.role.update({
        where: { id: officerRole.id },
        data: {
            permissions: {
                connect: permissions.map((p) => ({ id: p.id })),
            },
        },
    });
    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@chirohealth.com' },
        update: {},
        create: {
            email: 'admin@chirohealth.com',
            password: hashedPassword,
            name: 'Chiro Admin',
            roleId: adminRole.id,
        },
    });
    const officerUser = await prisma.user.upsert({
        where: { email: 'officer@chirohealth.com' },
        update: {},
        create: {
            email: 'officer@chirohealth.com',
            password: hashedPassword,
            name: 'Health Officer',
            roleId: officerRole.id,
        },
    });
    const facility1 = await prisma.facility.create({
        data: {
            name: 'Chiro City General Hospital',
            type: 'HOSPITAL',
            registrationNo: 'REG-H-001',
            licenseNo: 'LIC-H-001',
            licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            address: '123 Health Avenue, Chiro City',
            phone: '+251911000001',
            email: 'hospital@chirocity.gov',
            status: 'ACTIVE',
            services: JSON.stringify(['Emergency', 'Surgery', 'Outpatient', 'Lab']),
            legalInfo: JSON.stringify({ owner: 'Chiro City Administration', established: '2020' }),
        },
    });
    const facility2 = await prisma.facility.create({
        data: {
            name: 'Central Health Center',
            type: 'HEALTH_CENTER',
            registrationNo: 'REG-HC-002',
            licenseNo: 'LIC-HC-002',
            licenseExpiry: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
            address: '456 Community Road, Chiro City',
            phone: '+251911000002',
            email: 'center@chirocity.gov',
            status: 'ACTIVE',
            services: JSON.stringify(['Primary Care', 'Vaccination', 'Maternal']),
            legalInfo: JSON.stringify({ owner: 'Chiro City Administration' }),
        },
    });
    const facility3 = await prisma.facility.create({
        data: {
            name: 'Sunrise Pharmacy',
            type: 'PHARMACY',
            registrationNo: 'REG-P-003',
            licenseNo: 'LIC-P-003',
            licenseExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            address: '789 Main Street, Chiro City',
            phone: '+251911000003',
            email: 'pharmacy@chirocity.gov',
            status: 'ACTIVE',
            services: JSON.stringify(['Dispensing', 'Consultation']),
            legalInfo: JSON.stringify({ owner: 'Private' }),
        },
    });
    const facilities = [facility1, facility2, facility3];
    const staffData = [
        { employeeId: 'EMP-H-001', name: 'Dr. Abebe Kebede', email: 'abebe@chiro.gov', designation: 'Medical Director', department: 'Administration' },
        { employeeId: 'EMP-H-002', name: 'Sister Almaz Desta', email: 'almaz@chiro.gov', designation: 'Head Nurse', department: 'Nursing' },
        { employeeId: 'EMP-H-003', name: 'Dr. Bekele Haile', email: 'bekele@chiro.gov', designation: 'Surgeon', department: 'Surgery' },
        { employeeId: 'EMP-H-004', name: 'Tigist Mohammed', email: 'tigist@chiro.gov', designation: 'Lab Technician', department: 'Laboratory' },
        { employeeId: 'EMP-H-005', name: 'Dawit Tesfaye', email: 'dawit@chiro.gov', designation: 'Pharmacist', department: 'Pharmacy' },
        { employeeId: 'EMP-HC-001', name: 'Sister Genet Abebe', email: 'genet@chiro.gov', designation: 'Health Officer', department: 'Primary Care' },
        { employeeId: 'EMP-HC-002', name: 'Fitsum Tadesse', email: 'fitsum@chiro.gov', designation: 'Nurse', department: 'Nursing' },
        { employeeId: 'EMP-HC-003', name: 'Hanna Worku', email: 'hanna@chiro.gov', designation: 'Midwife', department: 'Maternal' },
        { employeeId: 'EMP-HC-004', name: 'Yonas Alemu', email: 'yonas@chiro.gov', designation: 'Vaccinator', department: 'Vaccination' },
        { employeeId: 'EMP-HC-005', name: 'Meron Teshome', email: 'meron@chiro.gov', designation: 'Receptionist', department: 'Admin' },
        { employeeId: 'EMP-P-001', name: 'Pharmacist Solomon', email: 'solomon@pharmacy.gov', designation: 'Lead Pharmacist', department: 'Dispensing' },
        { employeeId: 'EMP-P-002', name: 'Helen Getachew', email: 'helen@pharmacy.gov', designation: 'Pharmacist', department: 'Dispensing' },
        { employeeId: 'EMP-P-003', name: 'Samuel Bekele', email: 'samuel@pharmacy.gov', designation: 'Assistant', department: 'Dispensing' },
        { employeeId: 'EMP-P-004', name: 'Rahel Desta', email: 'rahel@pharmacy.gov', designation: 'Assistant', department: 'Dispensing' },
        { employeeId: 'EMP-P-005', name: 'Daniel Abebe', email: 'daniel@pharmacy.gov', designation: 'Cashier', department: 'Admin' },
    ];
    let idx = 0;
    for (const facility of facilities) {
        const slice = staffData.slice(idx, idx + 5);
        idx += 5;
        for (const s of slice) {
            const licenseExpiry = new Date(Date.now() + (90 + Math.floor(Math.random() * 300)) * 24 * 60 * 60 * 1000);
            await prisma.staff.create({
                data: {
                    ...s,
                    phone: '+2519110000' + String(idx).padStart(2, '0'),
                    facilityId: facility.id,
                    departmentName: s.department,
                    licenseNo: 'LIC-' + s.employeeId,
                    licenseExpiry,
                    status: 'ACTIVE',
                    joiningDate: new Date('2023-01-01'),
                    address: 'Chiro City',
                    emergencyContact: '+251922000000',
                },
            });
        }
    }
    console.log('Seed completed:', {
        adminUser: adminUser.email,
        officerUser: officerUser.email,
        facilities: facilities.length,
        staff: 15,
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map