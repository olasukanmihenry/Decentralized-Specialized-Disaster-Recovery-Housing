;; Displaced Person Verification Contract
;; Validates individuals needing shelter

(define-data-var last-person-id uint u0)

(define-map verified-persons
  { person-id: uint }
  {
    address: principal,
    name: (string-utf8 50),
    family-size: uint,
    verified: bool,
    needs: (string-utf8 100)
  }
)

(define-map verifiers
  { address: principal }
  { active: bool }
)

;; Only contract owner can add verifiers
(define-public (add-verifier (verifier-address principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) (err u1))
    (map-set verifiers
      { address: verifier-address }
      { active: true }
    )
    (ok true)
  )
)

(define-public (register-person
    (name (string-utf8 50))
    (family-size uint)
    (needs (string-utf8 100)))
  (let
    ((new-id (+ (var-get last-person-id) u1)))
    (var-set last-person-id new-id)
    (map-set verified-persons
      { person-id: new-id }
      {
        address: tx-sender,
        name: name,
        family-size: family-size,
        verified: false,
        needs: needs
      }
    )
    (ok new-id)
  )
)

(define-public (verify-person (person-id uint))
  (let
    ((is-verifier (default-to { active: false } (map-get? verifiers { address: tx-sender }))))
    (asserts! (get active is-verifier) (err u3))
    (match (map-get? verified-persons { person-id: person-id })
      person (begin
        (map-set verified-persons
          { person-id: person-id }
          (merge person { verified: true })
        )
        (ok true)
      )
      (err u4)
    )
  )
)

(define-read-only (get-person (person-id uint))
  (map-get? verified-persons { person-id: person-id })
)

(define-read-only (is-verified (person-id uint))
  (match (map-get? verified-persons { person-id: person-id })
    person (get verified person)
    false
  )
)

(define-constant contract-owner tx-sender)
