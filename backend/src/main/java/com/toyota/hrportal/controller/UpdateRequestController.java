package com.toyota.hrportal.controller;

import com.toyota.hrportal.entity.UpdateRequest;
import com.toyota.hrportal.entity.User;
import com.toyota.hrportal.service.UpdateRequestService;
import com.toyota.hrportal.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/update-requests")
@CrossOrigin(origins = "*")
public class UpdateRequestController {

    private final UpdateRequestService service;
    private final UserService userService;

    public UpdateRequestController(UpdateRequestService service, UserService userService) {
        this.service = service;
        this.userService = userService;
    }

    // Tüm güncelleme talepleri (İK ve Yönetici Panelleri için)
    @GetMapping
    public List<UpdateRequest> getAll() {
        return service.getAllUpdateRequests();
    }

    // Sadece belirli bir kullanıcının talepleri (Öznel / Çalışan Ekranı İçin)
    @GetMapping("/user/{userId}")
    public List<UpdateRequest> getByUserId(@PathVariable Long userId) {
        return service.getUpdateRequestsByUserId(userId);
    }

    @GetMapping("/{id}")
    public UpdateRequest getById(@PathVariable Long id) {
        return service.getUpdateRequestById(id);
    }

    @PostMapping
    public UpdateRequest save(@RequestBody UpdateRequest request) {
        if (request.getStatus() == null) {
            request.setStatus("PENDING");
        }

        // Eğer JSON içinden user objesi gelmemişse ancak user id gönderilmişse oradan yakalar
        if (request.getUser() == null) {
            User defaultUser = userService.getUserById(1L);
            request.setUser(defaultUser);
        }
        return service.saveUpdateRequest(request);
    }

    @PutMapping("/{id}")
    public UpdateRequest update(@PathVariable Long id,
                                @RequestBody UpdateRequest request) {
        return service.updateUpdateRequest(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteUpdateRequest(id);
    }

    @PutMapping("/{id}/manager/approve")
    public UpdateRequest managerApprove(@PathVariable Long id) {
        return service.approveByManager(id);
    }

    @PutMapping("/{id}/manager/reject")
    public UpdateRequest managerReject(@PathVariable Long id) {
        return service.rejectByManager(id);
    }

    @PutMapping("/{id}/hr/approve")
    public UpdateRequest hrApprove(@PathVariable Long id) {
        return service.approveByHr(id);
    }

    @PutMapping("/{id}/hr/reject")
    public UpdateRequest hrReject(@PathVariable Long id) {
        return service.rejectByHr(id);
    }
}