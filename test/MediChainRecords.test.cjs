const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("MediChainRecords", function () {
  let MediChainRecords;
  let mediChain;
  let owner;
  let doctor;
  let patient;
  let unauthorized;

  beforeEach(async function () {
    [owner, doctor, patient, unauthorized] = await ethers.getSigners();
    MediChainRecords = await ethers.getContractFactory("MediChainRecords");
    mediChain = await MediChainRecords.deploy();
    
    // Authorize the doctor
    await mediChain.authorizeUploader(doctor.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await mediChain.owner()).to.equal(owner.address);
    });

    it("Should authorize the owner by default", async function () {
      expect(await mediChain.authorizedUploaders(owner.address)).to.equal(true);
    });
  });

  describe("Medical Record Upload", function () {
    const ipfsHash = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco";
    const recordType = "PDF";

    it("Should allow authorized uploader to add a record", async function () {
      await expect(mediChain.connect(doctor).addMedicalRecord(patient.address, ipfsHash, recordType))
        .to.emit(mediChain, "MedicalRecordAdded")
        .withArgs(patient.address, ipfsHash, recordType, anyValue, doctor.address);

      const records = await mediChain.getPatientRecords(patient.address);
      expect(records.length).to.equal(1);
      expect(records[0].ipfsHash).to.equal(ipfsHash);
      expect(records[0].uploader).to.equal(doctor.address);
    });

    it("Should revert if unauthorized user tries to add a record", async function () {
      await expect(
        mediChain.connect(unauthorized).addMedicalRecord(patient.address, ipfsHash, recordType)
      ).to.be.revertedWith("Not authorized to upload");
    });

    it("Should allow owner to revoke authorization", async function () {
      await mediChain.revokeUploader(doctor.address);
      await expect(
        mediChain.connect(doctor).addMedicalRecord(patient.address, ipfsHash, recordType)
      ).to.be.revertedWith("Not authorized to upload");
    });
  });
});
