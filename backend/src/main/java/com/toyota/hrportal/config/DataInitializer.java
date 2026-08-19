package com.toyota.hrportal.config;

import com.toyota.hrportal.entity.Department;
import com.toyota.hrportal.entity.Role;
import com.toyota.hrportal.entity.User;
import com.toyota.hrportal.entity.enums.BenefitPackage;
import com.toyota.hrportal.entity.enums.EmploymentType;
import com.toyota.hrportal.entity.enums.UserStatus;
import com.toyota.hrportal.repository.DepartmentRepository;
import com.toyota.hrportal.repository.RoleRepository;
import com.toyota.hrportal.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    public DataInitializer(RoleRepository roleRepository,
                           DepartmentRepository departmentRepository,
                           UserRepository userRepository) {

        this.roleRepository = roleRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {

        createRoles();

        createDepartments();

        createUsers();

        System.out.println("Default data created.");
    }

    private void createRoles() {

        if (roleRepository.count() == 0) {

            roleRepository.save(new Role(null, "EMPLOYEE"));
            roleRepository.save(new Role(null, "MANAGER"));
            roleRepository.save(new Role(null, "HR_ADMIN"));
        }
    }

    private void createDepartments() {

        if (departmentRepository.count() == 0) {

            departmentRepository.save(new Department(null,"Information Technologies"));
            departmentRepository.save(new Department(null,"Human Resources"));
            departmentRepository.save(new Department(null,"Production"));
            departmentRepository.save(new Department(null,"Finance"));
            departmentRepository.save(new Department(null,"Quality"));
            departmentRepository.save(new Department(null,"Logistics"));
            departmentRepository.save(new Department(null,"Purchasing"));
        }
    }

    private void createUsers(){

        if(userRepository.count()>0)
            return;

        Role employeeRole = roleRepository.findByRoleName("EMPLOYEE").get();

        Department itDepartment =
                departmentRepository.findByDepartmentName("Information Technologies").get();

        User user = new User();

        user.setEmployeeNo("EMP-2024-001");
        user.setName("Murat");
        user.setSurname("Yılmaz");
        user.setEmail("murat@toyota.com");
        user.setPassword("123456");
        user.setPhone("05321234567");
        user.setAddress("Kocaeli");

        user.setBirthDate(LocalDate.of(1998,5,15));
        user.setHireDate(LocalDate.of(2018,3,1));

        user.setPosition("Software Engineer");

        user.setSalary(new BigDecimal("55867"));

        user.setMonthlySalary(new BigDecimal("53238"));

        user.setBenefitPackage(BenefitPackage.LUXURY);

        user.setChildrenCount(3);

        user.setEmploymentType(EmploymentType.PERMANENT);

        user.setStatus(UserStatus.ACTIVE);

        user.setEmergencyContactName("Ayşe Yılmaz");
        user.setEmergencyContactPhone("05335554433");

        user.setRole(employeeRole);
        user.setDepartment(itDepartment);

        userRepository.save(user);
    }

}