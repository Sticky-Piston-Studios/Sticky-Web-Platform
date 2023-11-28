import React, { useEffect, useState } from "react";
import styles from "../styles/Company.module.css";

function CompanyComponent() {
  const [company, setCompany] = useState(null);

  useEffect(() => {
    // Call the "GetCompany" endpoint when the component mounts
    fetch("/api/companies/GetCompany")
      .then((response) => response.json())
      .then((data) => {
        setCompany(data);
      })
      .catch((error) => {
        console.error("Error fetching company", error);
      });
  }, []);

  const addCompany = () => {
    // Call the "AddCompany" endpoint
    fetch("/api/companies/AddCompany", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Name: "New Company",
        Value: 100,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Company added", data);
      })
      .catch((error) => {
        console.error("Error adding company", error);
      });
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Company</h1>
        {company ? (
          <div>
            <p className={styles.description}>Name: {company.Name}</p>
            <p className={styles.description}>Value: {company.Value}</p>
          </div>
        ) : (
          <p className={styles.description}>Loading...</p>
        )}
        <button className={styles.card} onClick={addCompany}>
          Add Company
        </button>
      </main>
    </div>
  );
}

export default CompanyComponent;
