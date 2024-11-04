#!/usr/bin/env node
const fs = require('fs');
const xml2js = require('xml2js');
const plist = require('plist');

const configFile = 'config.xml';
const plistFile = 'ios/App/App/Info.plist';
const versionPrefix = 'release-';
const taggedVersion = process.argv[2];

// Function to check if the version format is valid
const isValid = version => new RegExp(`^${versionPrefix}(\\d+)\\.(\\d+)\\.(\\d+)\\.(\\d+)$`).test(version);

// Function to read a file and return its contents
const readFile = (filePath) => new Promise((resolve, reject) => {
  fs.readFile(filePath, 'utf8', (err, data) => (err ? reject(err) : resolve(data)));
});

// Function to write data to a file
const writeFile = (filePath, data) => new Promise((resolve, reject) => {
  fs.writeFile(filePath, data, (err) => (err ? reject(err) : resolve()));
});

// Function to update config.xml version
const updateConfigXml = async (version) => {
  const xml = await readFile(configFile);
  const obj = await xml2js.parseStringPromise(xml);

  obj.widget['$'].version = version;

  const builder = new xml2js.Builder({
    xmldec: {
      version: '1.0',
      encoding: 'UTF-8',
      standalone: null // Change to false if you don’t want it
    }
  });

  const updatedXml = builder.buildObject(obj);
  await writeFile(configFile, updatedXml);
  console.log(`Successfully updated the version to ${version} for the config.xml file`);
};

// Function to update Info.plist version
const updatePlist = async (version) => {
  const data = await readFile(plistFile);
  const parsedPlist = plist.parse(data);

  parsedPlist.CFBundleVersion = version;
  parsedPlist.CFBundleShortVersionString = version;

  const updatedPlist = plist.build(parsedPlist);
  await writeFile(plistFile, updatedPlist);
  console.log(`Successfully updated the version to ${version} for the Info.plist file`);
};

// Main function to run the updates
const main = async () => {
  if (!isValid(taggedVersion)) {
    throw new Error(`Invalid version format. Expected format: ${versionPrefix}x.x.x.x`);
  }

  const version = taggedVersion.replace(versionPrefix, '');

  await Promise.all([
    updateConfigXml(version),
    updatePlist(version)
  ]);
};

// Execute the main function
main().catch(console.error);
