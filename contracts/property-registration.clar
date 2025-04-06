;; Property Registration Contract
;; Records details of available temporary housing

(define-data-var last-property-id uint u0)

(define-map properties
  { property-id: uint }
  {
    owner: principal,
    location: (string-utf8 100),
    capacity: uint,
    available: bool,
    amenities: (string-utf8 100)
  }
)

(define-public (register-property
    (location (string-utf8 100))
    (capacity uint)
    (amenities (string-utf8 100)))
  (let
    ((new-id (+ (var-get last-property-id) u1)))
    (var-set last-property-id new-id)
    (map-set properties
      { property-id: new-id }
      {
        owner: tx-sender,
        location: location,
        capacity: capacity,
        available: true,
        amenities: amenities
      }
    )
    (ok new-id)
  )
)

(define-public (update-availability (property-id uint) (available bool))
  (let
    ((property (unwrap! (map-get? properties { property-id: property-id }) (err u1))))
    (asserts! (is-eq tx-sender (get owner property)) (err u2))
    (map-set properties
      { property-id: property-id }
      (merge property { available: available })
    )
    (ok true)
  )
)

(define-read-only (get-property (property-id uint))
  (map-get? properties { property-id: property-id })
)

(define-read-only (get-property-count)
  (var-get last-property-id)
)
