import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { ExternalLink, CheckCircle, XCircle, Loader } from 'lucide-react'

const DoctorVerificationRequests = () => {
  const [pendingDoctors, setPendingDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [verifyingDoctor, setVerifyingDoctor] = useState(null)

  useEffect(() => {
    fetchPendingDoctors()
  }, [])

  const fetchPendingDoctors = async () => {
    try {
      setLoading(true)
      const response = await axios.get("http://localhost:4000/api/v1/user/admin/doctors/pending", {
        withCredentials: true,
      })

      if (response.data.success) {
        setPendingDoctors(response.data.doctors || [])
      } else {
        toast.error("Failed to fetch pending doctor requests")
      }
    } catch (error) {
      console.error("Error fetching pending doctors:", error)
      toast.error(error.response?.data?.message || "Failed to fetch pending doctor requests")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyDoctor = async (doctorId) => {
    try {
      setVerifyingDoctor(doctorId)
      const response = await axios.put(
        `http://localhost:4000/api/v1/user/admin/doctors/verify/${doctorId}`,
        { nmcVerified: true },
        { withCredentials: true }
      )

      if (response.data.success) {
        toast.success("Doctor verified successfully")
        // Remove the verified doctor from the list
        setPendingDoctors((prev) => prev.filter((doctor) => doctor._id !== doctorId))
      } else {
        toast.error("Failed to verify doctor")
      }
    } catch (error) {
      console.error("Error verifying doctor:", error)
      toast.error(error.response?.data?.message || "Failed to verify doctor")
    } finally {
      setVerifyingDoctor(null)
    }
  }

  const handleRejectDoctor = async (doctorId) => {
    try {
      setVerifyingDoctor(doctorId)
      const response = await axios.put(
        `http://localhost:4000/api/v1/user/admin/doctors/verify/${doctorId}`,
        { nmcVerified: false },
        { withCredentials: true }
      )

      if (response.data.success) {
        toast.success("Doctor registration rejected")
        // Remove the rejected doctor from the list
        setPendingDoctors((prev) => prev.filter((doctor) => doctor._id !== doctorId))
      } else {
        toast.error("Failed to reject doctor")
      }
    } catch (error) {
      console.error("Error rejecting doctor:", error)
      toast.error(error.response?.data?.message || "Failed to reject doctor")
    } finally {
      setVerifyingDoctor(null)
    }
  }

  const openNMCVerification = (nmcNumber) => {
    window.open(`https://www.nmc.org.np/searchPractitioner`, "_blank")
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading pending verification requests...</span>
      </div>
    )
  }

  return (
    <div className="doctor-verification-container">
      <div className="section-header mb-6">
        <h2 className="text-2xl font-bold">Doctor Verification Requests</h2>
        <p className="text-gray-600">
          Verify doctor registrations by checking their NMC license number and credentials
        </p>
      </div>

      {pendingDoctors.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-gray-700">No pending verification requests</h3>
          <p className="text-gray-500 mt-2">All doctor registration requests have been processed</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pendingDoctors.map((doctor) => (
            <div key={doctor._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-xl font-semibold">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    <span className="font-medium">Department:</span> {doctor.doctorDepartment}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">NMC Number:</span> {doctor.nmcNumber}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Email:</span> {doctor.email}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Phone:</span> {doctor.phone}
                  </p>
                </div>

                <div className="flex flex-col space-y-3">
                  {doctor.signature && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-700 mb-1">Digital Signature:</p>
                      <a
                        href={doctor.signature.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center"
                      >
                        <span>View Signature</span>
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </a>
                    </div>
                  )}

                  <button
                    onClick={() => openNMCVerification(doctor.nmcNumber)}
                    className="flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Check NMC Number
                  </button>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleVerifyDoctor(doctor._id)}
                      disabled={verifyingDoctor === doctor._id}
                      className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                    >
                      {verifyingDoctor === doctor._id ? (
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Verify
                    </button>

                    <button
                      onClick={() => handleRejectDoctor(doctor._id)}
                      disabled={verifyingDoctor === doctor._id}
                      className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                    >
                      {verifyingDoctor === doctor._id ? (
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DoctorVerificationRequests
