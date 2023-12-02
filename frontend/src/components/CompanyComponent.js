import React, { useEffect, useState } from "react";
import styles from "../styles/Company.module.css";

function CompanyComponent() {
  const [companies, setCompanies] = useState([]);
  const [newCompany, setNewCompany] = useState({ Name: "", EmployeeCount: "" });

  const fetchCompanies = () => {
    // Call the "GetCompanies" endpoint
    fetch("/api/companies/") // for now it gets ALL
      .then((response) => response.json())
      .then((data) => {
        console.log("Got companies: ", data);
        setCompanies(data.value.data);
      })
      .catch((error) => {
        console.error("Error fetching companies", error);
      });
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const addCompany = (event) => {
    event.preventDefault();

    // Call the "AddCompany" endpoint
    fetch("/api/companies/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newCompany),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Company added", data);
        fetchCompanies(); // Refetch the companies
      })
      .catch((error) => {
        console.error("Error adding company", error);
      });
  };

  const deleteCompany = (id) => {
    // Call the "DeleteCompany" endpoint
    console.log("Deleting company with id: ", id);
    fetch(`/api/companies/${id}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Company deleted", data);
        setCompanies(companies.filter((company) => company._id !== id));
      })
      .catch((error) => {
        console.error("Error deleting company", error);
      });
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Companies</h1>
        {companies.length > 0 ? (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>EmployeeCount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company, index) => (
                  <tr key={index}>
                    <td>{company.Name}</td>
                    <td>{company.EmployeeCount}</td>
                    <td>
                      <button
                        className={styles.deleteButton}
                        onClick={() => deleteCompany(company._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={styles.description}>Loading...</p>
        )}
        <form className={styles.form} onSubmit={addCompany}>
          <input
            type="text"
            className={styles.input}
            value={newCompany.Name}
            onChange={(e) =>
              setNewCompany({ ...newCompany, Name: e.target.value })
            }
            placeholder="Company Name"
            required
          />
          <input
            type="number"
            className={styles.input}
            value={newCompany.EmployeeCount}
            onChange={(e) =>
              setNewCompany({ ...newCompany, EmployeeCount: e.target.value })
            }
            placeholder="Company employeeCount"
            required
          />
          <button type="submit" className={styles.card}>
            Add Company
          </button>
        </form>
      </main>
    </div>
  );
}

export default CompanyComponent;
