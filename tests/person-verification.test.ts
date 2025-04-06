import { describe, it, expect, beforeEach } from 'vitest';

describe('Person Verification Contract', () => {
  let mockPersons = new Map();
  let mockVerifiers = new Map();
  let lastPersonId = 0;
  
  let mockTxSender = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const mockContractOwner = mockTxSender;
  
  // Mock functions
  const addVerifier = (verifierAddress) => {
    if (mockTxSender !== mockContractOwner) {
      return { success: false, error: 1 };
    }
    
    mockVerifiers.set(verifierAddress, { active: true });
    return { success: true, value: true };
  };
  
  const registerPerson = (name, familySize, needs) => {
    const newId = lastPersonId + 1;
    lastPersonId = newId;
    
    mockPersons.set(newId, {
      address: mockTxSender,
      name,
      familySize,
      verified: false,
      needs
    });
    
    return { success: true, value: newId };
  };
  
  const verifyPerson = (personId) => {
    if (!mockVerifiers.has(mockTxSender) || !mockVerifiers.get(mockTxSender).active) {
      return { success: false, error: 3 };
    }
    
    if (!mockPersons.has(personId)) {
      return { success: false, error: 4 };
    }
    
    const person = mockPersons.get(personId);
    person.verified = true;
    mockPersons.set(personId, person);
    
    return { success: true, value: true };
  };
  
  const getPerson = (personId) => {
    return mockPersons.get(personId) || null;
  };
  
  const isVerified = (personId) => {
    const person = mockPersons.get(personId);
    return person ? person.verified : false;
  };
  
  beforeEach(() => {
    mockPersons.clear();
    mockVerifiers.clear();
    lastPersonId = 0;
    
    // Add contract owner as a verifier by default
    mockVerifiers.set(mockContractOwner, { active: true });
  });
  
  it('should register a new person', () => {
    const result = registerPerson('John Doe', 3, 'Requires wheelchair access');
    expect(result.success).toBe(true);
    expect(result.value).toBe(1);
    
    const person = getPerson(1);
    expect(person).not.toBeNull();
    expect(person.name).toBe('John Doe');
    expect(person.familySize).toBe(3);
    expect(person.verified).toBe(false);
  });
  
  it('should verify a person', () => {
    registerPerson('John Doe', 3, 'Requires wheelchair access');
    
    const result = verifyPerson(1);
    expect(result.success).toBe(true);
    
    const isPersonVerified = isVerified(1);
    expect(isPersonVerified).toBe(true);
  });
  
  it('should fail to verify if not a verifier', () => {
    registerPerson('John Doe', 3, 'Requires wheelchair access');
    
    // Simulate different tx-sender who is not a verifier
    const originalTxSender = mockTxSender;
    mockTxSender = 'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    
    const result = verifyPerson(1);
    expect(result.success).toBe(false);
    expect(result.error).toBe(3);
    
    // Reset tx-sender
    mockTxSender = originalTxSender;
  });
});
