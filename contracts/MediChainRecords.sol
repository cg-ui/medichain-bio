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

    // Mapping from patient address to their records
    mapping(address => MedicalRecord[]) private patientRecords;
    
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
}
