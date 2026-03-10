import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ALL_PERMISSIONS, PERMISSIONS } from '../src/common/constants';

const prisma = new PrismaClient();

/** All permission names for seed (must match PERMISSIONS in constants). */
const PERMISSION_NAMES = [...ALL_PERMISSIONS];

/** Officer can do everything except delete facilities/staff and delete documents. */
const OFFICER_PERMISSION_SET = new Set<string>([
  PERMISSIONS.DASHBOARD_VIEW,
  PERMISSIONS.FACILITIES_READ,
  PERMISSIONS.FACILITIES_CREATE,
  PERMISSIONS.FACILITIES_UPDATE,
  PERMISSIONS.STAFF_READ,
  PERMISSIONS.STAFF_CREATE,
  PERMISSIONS.STAFF_UPDATE,
  PERMISSIONS.DOCUMENTS_FACILITY_READ,
  PERMISSIONS.DOCUMENTS_FACILITY_UPLOAD,
  PERMISSIONS.DOCUMENTS_STAFF_READ,
  PERMISSIONS.DOCUMENTS_STAFF_UPLOAD,
  PERMISSIONS.NOTIFICATIONS_READ,
  PERMISSIONS.NOTIFICATIONS_MARK_READ,
]);

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
      description: 'Add/update facilities and staff; no delete',
    },
  });

  const permissionRecords = await Promise.all(
    PERMISSION_NAMES.map((name) =>
      prisma.permission.upsert({
        where: { name },
        update: {},
        create: { name, description: name },
      }),
    ),
  );

  const permissionIds = permissionRecords.map((p) => ({ id: p.id }));
  const officerPermissionIds = permissionRecords
    .filter((p) => OFFICER_PERMISSION_SET.has(p.name))
    .map((p) => ({ id: p.id }));

  await prisma.role.update({
    where: { id: adminRole.id },
    data: { permissions: { set: [], connect: permissionIds } },
  });

  await prisma.role.update({
    where: { id: officerRole.id },
    data: { permissions: { set: [], connect: officerPermissionIds } },
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

  // Create 3 facilities with 5 staff each (only if not already present)
  const existingFacilityCount = await prisma.facility.count();
  if (existingFacilityCount === 0) {
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
  }

  console.log('Seed completed:', {
    adminUser: adminUser.email,
    officerUser: officerUser.email,
    permissions: PERMISSION_NAMES.length,
    officerPermissions: OFFICER_PERMISSION_SET.size,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
