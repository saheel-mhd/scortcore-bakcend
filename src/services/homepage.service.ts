import type { Prisma } from "@prisma/client";

import { homepageModel } from "../models/homepage.model.js";
import { AppError } from "../utils/app-error.js";
import type {
  CreateHomepageInput,
  UpdateHomepageBannerInput,
  UpdateHomepageInput,
  UpdateHomepageLayoutInput,
  UpdateHomepageSectionsInput,
} from "../validations/homepage.validation.js";

const HOMEPAGE_KEY = "main";

const getHomepage = async () => {
  const homepage = await homepageModel.findHomepageByKey(HOMEPAGE_KEY);

  if (!homepage) {
    throw new AppError("Homepage configuration not found", 404);
  }

  return homepage;
};

const createHomepage = async (input: CreateHomepageInput) => {
  const existingHomepage = await homepageModel.findHomepageByKey(HOMEPAGE_KEY);

  if (existingHomepage) {
    throw new AppError("Homepage configuration already exists", 409);
  }

  return homepageModel.createHomepage({
    key: HOMEPAGE_KEY,
    sections: input.sections as unknown as Prisma.InputJsonValue,
    banner: input.banner as unknown as Prisma.InputJsonValue,
    layoutConfig: input.layoutConfig as unknown as Prisma.InputJsonValue,
  });
};

const updateHomepage = async (input: UpdateHomepageInput) => {
  const existingHomepage = await homepageModel.findHomepageByKey(HOMEPAGE_KEY);

  if (!existingHomepage) {
    throw new AppError("Homepage configuration not found", 404);
  }

  return homepageModel.updateHomepage(HOMEPAGE_KEY, {
    sections: input.sections as unknown as Prisma.InputJsonValue,
    banner: input.banner as unknown as Prisma.InputJsonValue,
    layoutConfig: input.layoutConfig as unknown as Prisma.InputJsonValue,
  });
};

const updateHomepageSections = async (input: UpdateHomepageSectionsInput) => {
  const existingHomepage = await homepageModel.findHomepageByKey(HOMEPAGE_KEY);

  if (!existingHomepage) {
    throw new AppError("Homepage configuration not found", 404);
  }

  return homepageModel.updateHomepage(HOMEPAGE_KEY, {
    sections: input.sections as unknown as Prisma.InputJsonValue,
  });
};

const updateHomepageBanner = async (input: UpdateHomepageBannerInput) => {
  const existingHomepage = await homepageModel.findHomepageByKey(HOMEPAGE_KEY);

  if (!existingHomepage) {
    throw new AppError("Homepage configuration not found", 404);
  }

  return homepageModel.updateHomepage(HOMEPAGE_KEY, {
    banner: input.banner as unknown as Prisma.InputJsonValue,
  });
};

const updateHomepageLayout = async (input: UpdateHomepageLayoutInput) => {
  const existingHomepage = await homepageModel.findHomepageByKey(HOMEPAGE_KEY);

  if (!existingHomepage) {
    throw new AppError("Homepage configuration not found", 404);
  }

  return homepageModel.updateHomepage(HOMEPAGE_KEY, {
    layoutConfig: input.layoutConfig as unknown as Prisma.InputJsonValue,
  });
};

const deleteHomepage = async () => {
  const existingHomepage = await homepageModel.findHomepageByKey(HOMEPAGE_KEY);

  if (!existingHomepage) {
    throw new AppError("Homepage configuration not found", 404);
  }

  return homepageModel.deleteHomepage(HOMEPAGE_KEY);
};

export const homepageService = {
  getHomepage,
  createHomepage,
  updateHomepage,
  updateHomepageSections,
  updateHomepageBanner,
  updateHomepageLayout,
  deleteHomepage,
};
