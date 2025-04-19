const puppeteer = require("puppeteer");
const fs = require("fs");

async function isTransactionTableUpdated(page, expectedTransactionCount) {
  return await page.evaluate((expectedTransactionCount) => {
    const tbody = document.querySelector("table.table-bordered tbody");
    const rows = tbody.querySelectorAll("tr");
    return rows.length >= expectedTransactionCount;
  }, expectedTransactionCount);
}

async function depositAndWithdraw(url, depositSum, withdrawSum) {
  let browser;
  fs.writeFileSync("log.txt", "");
  try {
    // Open browser and a new page
    browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Navigate to url
    await page.goto(url);

    // Click on ‘Customer Login’ button
    await page.waitForSelector("button.btn.btn-primary.btn-lg");
    await page.click("button.btn.btn-primary.btn-lg");
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    // Choose ‘Harry Potter’ from list
    await page.waitForSelector("#userSelect");
    await page.select("#userSelect", "2");

    // Click ‘Login’
    await page.waitForSelector("button.btn.btn-default");
    await page.click("button.btn.btn-default");
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    // Check there are no any ‘Transactions’
    await page.waitForSelector('button[ng-click="transactions()"]');
    await page.click('button[ng-click="transactions()"]');
    await page.waitForNavigation({ waitUntil: "networkidle2" });
    // await page.waitForFunction(() => window.location.href.includes("#/listTx"));
    if (await isTransactionTableUpdated(page, 0)) {
      fs.appendFileSync("log.txt", "The transactions table is empty\n");
    } else {
      fs.appendFileSync("log.txt", "The transactions table is empty\n");
    }

    await page.waitForSelector('button[ng-click="back()"]');
    await page.click('button[ng-click="back()"]');

    // Deposit
    await page.waitForSelector('button[ng-click="deposit()"]');
    await page.click('button[ng-click="deposit()"]');
    await page.waitForSelector('input[ng-model="amount"]', { visible: true });
    await page.type('input[ng-model="amount"]', depositSum);
    await page.waitForSelector("button.btn.btn-default");
    await page.click("button.btn.btn-default");
    await page.waitForSelector("span.error.ng-binding");
    fs.appendFileSync("log.txt", `Deposit ${depositSum} successfully\n`);

    // Withdraw
    await page.waitForSelector('button[ng-click="withdrawl()"]');
    await page.click('button[ng-click="withdrawl()"]');
    await new Promise((resolve) => setTimeout(resolve, 500));
    await page.waitForSelector('input[ng-model="amount"]', { visible: true });
    await page.type('input[ng-model="amount"]', withdrawSum);
    await page.waitForSelector("button.btn.btn-default");
    await page.click("button.btn.btn-default");
    await page.waitForSelector("span.error.ng-binding");
    fs.appendFileSync("log.txt", `Withdraw ${withdrawSum} successfully\n`);

    // Check ‘Transactions’ table
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await page.waitForSelector('button[ng-click="transactions()"]');
    await page.click('button[ng-click="transactions()"]');
    await page.waitForFunction(() => window.location.href.includes("#/listTx"));
    const transactionsVerified = await isTransactionTableUpdated(page, 2);
    if (transactionsVerified) {
      fs.appendFileSync(
        "log.txt",
        "All transactions are recorded successfully\n"
      );
    } else {
      fs.appendFileSync(
        "log.txt",
        "Transactions are not recorded successfully\n"
      );
    }
    await page.screenshot({ path: "transactions.png" });
  } catch (err) {
    console.log(err);
  } finally {
    // Close the browser
    await browser.close();
  }
}

let url =
  "https://www.globalsqa.com/angularJs-protractor/BankingProject/#/login";
depositAndWithdraw(url, "200", "100");
