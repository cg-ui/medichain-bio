// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MediChainRecords
 * @dev Stores medical record references on-chain for immutable audit logging.
 */
contract MediChainRecords {
    struct MedicalRecord {
        address patientAddress;
        string ipfsHash;
        string recordType;
        uint256 timestamp;
        address uploader;
    }

    struct AccessGrant {
        address doctor;
        string[] modules;
        uint256 expiry;
        bool active;
    }

    struct EmergencyAccess {
        string reason;
        uint256 expiry;
        bool active;
    }

    // Mapping from patient address to their records
    mapping(address => MedicalRecord[]) private patientRecords;
    
    // Mapping from patient to doctor to their access grant
    mapping(address => mapping(address => AccessGrant)) public grants;
    // Track doctors who have access for a patient
    mapping(address => address[]) private patientDoctors;

    // Emergency Access
    mapping(address => bool) public emergencyUnlock;
    mapping(address => mapping(address => EmergencyAccess)) public emergencyGrants;
    
    // Role management
    mapping(address => bool) public authorizedUploaders;
    address public owner;

    event MedicalRecordAdded(
        address indexed patientAddress,
        string ipfsHash,
        string recordType,
        uint256 timestamp,
        address indexed uploader
    );

    event AccessGranted(
        address indexed patient,
        address indexed doctor,
        string[] modules,
        uint256 expiry
    );

    event AccessRevoked(
        address indexed patient,
        address indexed doctor
    );

    event EmergencyUnlockToggled(
        address indexed patient,
        bool status
    );

    event EmergencyAccessGranted(
        address indexed patient,
        address indexed doctor,
        string reason,
        uint256 expiry
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedUploaders[msg.sender] || msg.sender == owner, "Not authorized to upload");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedUploaders[msg.sender] = true;
    }

    /**
     * @dev Authorize a new uploader (e.g., a doctor or hospital node)
     */
    function authorizeUploader(address _uploader) external onlyOwner {
        authorizedUploaders[_uploader] = true;
    }

    /**
     * @dev Revoke authorization from an uploader
     */
    function revokeUploader(address _uploader) external onlyOwner {
        authorizedUploaders[_uploader] = false;
    }

    /**
     * @dev Adds a new medical record reference to the blockchain
     * @param _patientAddress The address of the patient
     * @param _ipfsHash The IPFS CID of the encrypted medical file
     * @param _recordType The type of record (e.g., "PDF", "DICOM", "Lab Result")
     */
    function addMedicalRecord(
        address _patientAddress,
        string calldata _ipfsHash,
        string calldata _recordType
    ) external onlyAuthorized {
        MedicalRecord memory newRecord = MedicalRecord({
            patientAddress: _patientAddress,
            ipfsHash: _ipfsHash,
            recordType: _recordType,
            timestamp: block.timestamp,
            uploader: msg.sender
        });

        patientRecords[_patientAddress].push(newRecord);

        emit MedicalRecordAdded(
            _patientAddress,
            _ipfsHash,
            _recordType,
            block.timestamp,
            msg.sender
        );
    }

    /**
     * @dev Retrieves all records for a specific patient
     * Note: In production, we'd use events for the audit log, 
     * but this provides a direct view for the UI if needed.
     */
    function getPatientRecords(address _patientAddress) external view returns (MedicalRecord[] memory) {
        return patientRecords[_patientAddress];
    }

    /**
     * @dev Grant access to a doctor for specific data modules
     */
    function grantAccess(address _doctor, string[] calldata _modules, uint256 _duration) external {
        uint256 expiry = block.timestamp + _duration;
        
        grants[msg.sender][_doctor] = AccessGrant({
            doctor: _doctor,
            modules: _modules,
            expiry: expiry,
            active: true
        });

        // Add to patientDoctors list if not already there
        bool exists = false;
        for (uint i = 0; i < patientDoctors[msg.sender].length; i++) {
            if (patientDoctors[msg.sender][i] == _doctor) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            patientDoctors[msg.sender].push(_doctor);
        }

        emit AccessGranted(msg.sender, _doctor, _modules, expiry);
    }

    /**
     * @dev Revoke access from a doctor
     */
    function revokeAccess(address _doctor) external {
        grants[msg.sender][_doctor].active = false;
        emit AccessRevoked(msg.sender, _doctor);
    }

    /**
     * @dev Get all doctors who have (or had) access for a patient
     */
    function getPatientDoctors(address _patient) external view returns (address[] memory) {
        return patientDoctors[_patient];
    }

    /**
     * @dev Check if a doctor has active access to a patient's data
     */
    function hasAccess(address _patient, address _doctor) external view returns (bool) {
        // Check standard grant
        AccessGrant memory grant = grants[_patient][_doctor];
        if (grant.active && block.timestamp < grant.expiry) {
            return true;
        }

        // Check global emergency unlock
        if (emergencyUnlock[_patient]) {
            return true;
        }

        // Check specific emergency grant
        EmergencyAccess memory eGrant = emergencyGrants[_patient][_doctor];
        if (eGrant.active && block.timestamp < eGrant.expiry) {
            return true;
        }

        return false;
    }

    /**
     * @dev Toggle emergency unlock status for the caller (patient)
     */
    function toggleEmergencyUnlock(bool _status) external {
        emergencyUnlock[msg.sender] = _status;
        emit EmergencyUnlockToggled(msg.sender, _status);
    }

    /**
     * @dev Request emergency access to a patient's records
     * @param _patient The address of the patient
     * @param _reason The reason for emergency access
     */
    function grantEmergencyAccess(address _patient, string calldata _reason) external {
        // Emergency access is time-bound to 24 hours
        uint256 expiry = block.timestamp + 24 hours;
        
        emergencyGrants[_patient][msg.sender] = EmergencyAccess({
            reason: _reason,
            expiry: expiry,
            active: true
        });

        emit EmergencyAccessGranted(_patient, msg.sender, _reason, expiry);
    }
}
