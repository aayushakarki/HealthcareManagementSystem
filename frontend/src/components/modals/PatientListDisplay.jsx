import { UserRound, Phone, Mail, Calendar, Eye } from "lucide-react"

const PatientListDisplay = ({ patients, onViewDetails }) => (
  <div className="patients-grid">
    {patients.map((patient) => (
      <div key={patient.id || patient._id} className="patient-card">
        <div className="patient-avatar">
          {patient.userAvatar?.url ? (
            <img
              src={patient.userAvatar.url}
              alt={`${patient.firstName} ${patient.lastName}`}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <UserRound className="w-12 h-12 text-gray-400" />
          )}
        </div>
        <div className="patient-info">
          <h3 className="patient-name">
            {patient.firstName} {patient.lastName}
          </h3>
          <div className="patient-details">
            <div className="detail-item">
              <Phone className="w-4 h-4 text-gray-500" />
              <span>{patient.phone}</span>
            </div>
            <div className="detail-item">
              <Mail className="w-4 h-4 text-gray-500" />
              <span>{patient.email}</span>
            </div>
            <div className="detail-item">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>
                Last visit:{" "}
                {new Date(patient.lastVisit || patient.dob).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="patient-actions">
          <button
            className="view-details-btn flex items-center gap-1"
            onClick={() => onViewDetails(patient.id || patient._id)}
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
        </div>
      </div>
    ))}
  </div>
);

export default PatientListDisplay;
