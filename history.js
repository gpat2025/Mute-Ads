 let adStats = [];
    let currentSort = { key: "count", dir: "desc" };

    function aggregateData(history) {
      const map = {};
      for (const entry of history) {
        const name = entry.adName || "Unknown";
        if (!map[name]) {
          map[name] = { adName: name, count: 0, duration: 0 };
        }
        map[name].count++;
        map[name].duration += parseInt(entry.delay || 0);
      }
      return Object.values(map);
    }

    function renderDashboard(data) {
      const tbody = document.getElementById("dashboard-body");
      tbody.innerHTML = "";

      const query = document.getElementById("searchInput").value.toLowerCase();

      const filtered = data
        .filter(d => d.adName.toLowerCase().includes(query))
        .sort((a, b) => {
          const valA = a[currentSort.key];
          const valB = b[currentSort.key];
          return currentSort.dir === "asc" ? valA - valB : valB - valA;
        });

      for (const stat of filtered) {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${stat.adName}</td>
          <td>${stat.count}</td>
          <td>${stat.duration}</td>
        `;
        tbody.appendChild(row);
      }

      if (filtered.length === 0) {
        tbody.innerHTML = "<tr><td colspan='3'>No results</td></tr>";
      }
    }

    // Event listeners
    /* document.getElementById("clearBtn").addEventListener("click", () => {
      chrome.storage.local.set({ muteHistory: [] }, () => {
        adStats = [];
        renderDashboard(adStats);
      });
    }); */

    document.getElementById("exportBtn").addEventListener("click", () => {
      const csv = "Ad Name,Count,Total Duration (s)\n" + adStats.map(stat =>
        `"${stat.adName.replace(/"/g, '""')}",${stat.count},${stat.duration}`
      ).join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ad_mute_dashboard.csv";
      a.click();
      URL.revokeObjectURL(url);
    });

    document.getElementById("searchInput").addEventListener("input", () => {
      renderDashboard(adStats);
    });

    document.querySelectorAll("th").forEach(th => {
      th.addEventListener("click", () => {
        const key = th.dataset.sort;
        if (currentSort.key === key) {
          currentSort.dir = currentSort.dir === "asc" ? "desc" : "asc";
        } else {
          currentSort.key = key;
          currentSort.dir = "desc";
        }
        renderDashboard(adStats);
      });
    });

    chrome.storage.local.get("muteHistory", ({ muteHistory }) => {
      adStats = aggregateData(muteHistory || []);
      renderDashboard(adStats);
    });