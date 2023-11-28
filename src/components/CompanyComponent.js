import React, { useEffect, useState } from "react";
import styles from "../styles/Company.module.css";

function CompanyComponent() {
  const [companies, setCompanies] = useState([]);
  const [newCompany, setNewCompany] = useState({ Name: "", Value: "" });

  const fetchCompanies = () => {
    // Call the "GetCompanies" endpoint
    fetch("/api/companies/GetCompanies")
      .then((response) => response.json())
      .then((data) => {
        setCompanies(data);
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
    fetch("/api/companies/AddCompany", {
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

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Companies</h1>
        {companies.length > 0 ? (
          <ul>
            {companies.map((company, index) => (
              <li key={index}>
                <p className={styles.description}>Name: {company.Name}</p>
                <p className={styles.description}>Value: {company.Value}</p>
              </li>
            ))}
          </ul>
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
            value={newCompany.Value}
            onChange={(e) =>
              setNewCompany({ ...newCompany, Value: e.target.value })
            }
            placeholder="Company Value"
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
