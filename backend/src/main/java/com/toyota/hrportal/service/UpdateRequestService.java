package com.toyota.hrportal.service;

import com.toyota.hrportal.entity.UpdateRequest;
import java.util.List;

public interface UpdateRequestService {

    List<UpdateRequest> getAllUpdateRequests();

    UpdateRequest getUpdateRequestById(Long id);

    UpdateRequest saveUpdateRequest(UpdateRequest updateRequest);

    UpdateRequest updateUpdateRequest(Long id, UpdateRequest updateRequest);

    void deleteUpdateRequest(Long id);

    UpdateRequest approveByManager(Long id);

    UpdateRequest rejectByManager(Long id);

    UpdateRequest approveByHr(Long id);

    UpdateRequest rejectByHr(Long id);
    List<UpdateRequest> getUpdateRequestsByUserId(Long userId);
}